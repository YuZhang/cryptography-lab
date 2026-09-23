// MAC 与哈希教学库：CRC32、WEP 式 MAC 伪造、变长 MAC 馊主意、CBC-MAC 攻防、
// 玩具 Merkle-Damgård 哈希与长度扩展、生日悖论、强全域函数（SUF）
// 仅为演示原理，无任何真实安全性

import { xorshift32, prgStream } from './prg'
import { toyPrp } from './toycipher'

// ── CRC32（真实算法，WEP 同款）──

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

export function crc32(bytes: number[]): number {
  let c = 0xffffffff
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

export const u32ToBytes = (v: number): number[] => [
  v & 0xff,
  (v >>> 8) & 0xff,
  (v >>> 16) & 0xff,
  (v >>> 24) & 0xff,
]

export const bytesToU32 = (b: number[]): number =>
  ((b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0)

// ── WEP 式 MAC：tag = (r, F(k,r) ⊕ CRC32(m)) ──

export interface WepTag {
  r: number
  t: number[] // 4 字节
}

function wepKeystream(k: number, r: number): number[] {
  return prgStream((k * 256 + r) >>> 0, 4)
}

export function wepMac(k: number, m: number[]): WepTag {
  const r = Math.floor(Math.random() * 256)
  const ks = wepKeystream(k, r)
  const crc = u32ToBytes(crc32(m))
  return { r, t: ks.map((b, i) => b ^ crc[i]) }
}

export function wepVrfy(k: number, m: number[], tag: WepTag): boolean {
  const ks = wepKeystream(k, tag.r)
  const crc = u32ToBytes(crc32(m))
  return ks.every((b, i) => (b ^ crc[i]) === tag.t[i])
}

/** WEP 伪造攻击：由一次查询 (m', (r,t')) 恢复 F(k,r)，为任意新消息伪造标签 */
export function wepForge(mOrig: number[], tag: WepTag, mNew: number[]): WepTag {
  const crcOrig = u32ToBytes(crc32(mOrig))
  const ks = tag.t.map((b, i) => b ^ crcOrig[i]) // F(k, r) 已恢复
  const crcNew = u32ToBytes(crc32(mNew))
  return { r: tag.r, t: ks.map((b, i) => b ^ crcNew[i]) }
}

// ── 固定长度玩具 MAC（单块，基于玩具 PRF）──

export function blockMac(k: number, m: number): number {
  return toyPrp(k).enc(m & 0xff)
}

export type VarMacKind = 'xor' | 'perblock' | 'indexed'

/** 变长 MAC 的三种馊主意 */
export function varMac(k: number, blocks: number[], kind: VarMacKind): number[] {
  if (kind === 'xor') {
    const x = blocks.reduce((a, b) => a ^ b, 0)
    return [blockMac(k, x)]
  }
  if (kind === 'perblock') return blocks.map((b) => blockMac(k, b))
  return blocks.map((b, i) => blockMac(k, (i ^ b) & 0xff))
}

export function varVrfy(k: number, blocks: number[], tag: number[], kind: VarMacKind): boolean {
  const expect = varMac(k, blocks, kind)
  return expect.length === tag.length && expect.every((b, i) => b === tag[i])
}

// ── CBC-MAC（玩具：8 比特块）──

export interface CbcMacOpts {
  ivZero: boolean // 改动1：IV 固定为 0
  lastOnly: boolean // 改动2：标签只含最后一块
  prependLength: boolean // 变长修法：开头加长度块
  ecbcK2?: number // 变长修法：ECBC，用 k2 加密末块输出
}

export function cbcMacRaw(k: number, blocks: number[], opts: CbcMacOpts): { chain: number[]; tag: number[] } {
  const prp = toyPrp(k)
  const iv = opts.ivZero ? 0 : Math.floor(Math.random() * 256)
  const input = opts.prependLength ? [blocks.length & 0xff, ...blocks] : blocks
  const chain: number[] = [iv]
  let prev = iv
  for (const b of input) {
    prev = prp.enc(prev ^ b)
    chain.push(prev)
  }
  const last = opts.ecbcK2 !== undefined ? toyPrp(opts.ecbcK2).enc(prev) : prev
  const tag = opts.lastOnly ? [last] : [...chain.slice(1)]
  return { chain, tag: opts.ivZero ? tag : [iv, ...tag] }
}

/** 变长追加攻击：已知单块消息 m 的标签 t，伪造 (m, m₂) 使标签仍为 t——取 m₂ = x ⊕ t */
export function cbcAppendForge(m: number, t: number): number[] {
  return [m, m ^ t]
}

// ── 玩具 Merkle-Damgård 哈希（Davies-Meyer 风格压缩）──

/** 压缩函数 h(z, x) = F_x(z) ⊕ z（Davies-Meyer 玩具版，8 比特状态） */
export function toyCompress(z: number, x: number): number {
  return toyPrp(x).enc(z & 0xff) ^ (z & 0xff)
}

/** 玩具 MD 哈希：IV=0，逐字节压缩（教学简化版，不含长度块） */
export function toyMd(bytes: number[], iv = 0): number {
  let z = iv & 0xff
  for (const b of bytes) z = toyCompress(z, b)
  return z
}

/** 长度扩展：从已知状态 state 继续压缩更多块（不需要知道密钥） */
export function toyMdExtend(state: number, extra: number[]): number {
  let z = state & 0xff
  for (const b of extra) z = toyCompress(z, b)
  return z
}

/** 不安全 MAC：t = H(k ‖ m)（前缀密钥，存在长度扩展攻击） */
export function prefixKeyMac(k: number, m: number[]): number {
  return toyMd([k, ...m])
}

/** HMAC 玩具版：H(k₂ ‖ H(k₁ ‖ m))，双重包裹 */
export function toyHmac(k1: number, k2: number, m: number[]): number {
  return toyMd([k2, toyMd([k1, ...m])])
}

// ── 生日悖论 ──

/** 精确概率：n 个人中至少两人生日相同的概率（D 个"生日"） */
export function birthdayExact(n: number, days = 365): number {
  if (n > days) return 1
  let p = 1
  for (let i = 0; i < n; i++) p *= (days - i) / days
  return 1 - p
}

/** 蒙特卡洛：bits 比特玩具哈希下，找到碰撞所需样本数 */
export function collisionTrial(bits: number, seed: number): number {
  const rnd = xorshift32(seed)
  const mask = (1 << bits) - 1
  const seen = new Set<number>()
  let n = 0
  for (;;) {
    const v = rnd() & mask
    n++
    if (seen.has(v)) return n
    seen.add(v)
  }
}

// ── 强全域函数（SUF）：h_{a,b}(m) = a·m + b mod p ──

export function sufMac(a: number, b: number, m: number, p: number): number {
  return (((a * (m % p)) % p) + b) % p
}

/** 与观察 (m', t') 一致的全部密钥（恰好 p 个） */
export function sufKeyCandidates(m1: number, t1: number, p: number): [number, number][] {
  const out: [number, number][] = []
  const mm = ((m1 % p) + p) % p
  for (let a = 0; a < p; a++) {
    const b = (((t1 - a * mm) % p) + p) % p
    out.push([a, b])
  }
  return out
}

export function isPrime(n: number): boolean {
  if (n < 2) return false
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false
  return true
}

export const hex2 = (n: number) => n.toString(16).padStart(2, '0').toUpperCase()
export const bytesToHex = (bs: number[]) => bs.map((b) => hex2(b)).join(' ')
