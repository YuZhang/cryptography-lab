// 认证加密教学库：Trans 编码反例、玩具 CTR、非原子解密模拟、固定 IV 攻击、
// SIV 合成初始向量、XEX 可调加密、KDF/HKDF/PBKDF
// 仅为演示原理，无任何真实安全性

import { prgStream, xorshift32 } from './prg'
import { toyPrp } from './toycipher'
import { toyMd } from './machash'

// ── Trans 编码（AtE 反例用）：0 → 00；1 → 01 或 10（随机）──

export function transEncode(bit: 0 | 1): [number, number] {
  if (bit === 0) return [0, 0]
  return Math.random() < 0.5 ? [0, 1] : [1, 0]
}

/** 解码：00→0；01/10→1；11→⊥（null） */
export function transDecode(a: number, b: number): 0 | 1 | null {
  if (a === 0 && b === 0) return 0
  if (a + b === 1) return 1
  return null
}

// ── 玩具 CTR：c = m ⊕ stream(key, iv)（按比特）──

export function ctrCryptBits(key: number, iv: number, bits: number[]): number[] {
  const rnd = xorshift32((key * 256 + iv) >>> 0)
  return bits.map((b) => b ^ (rnd() & 1))
}

/** 玩具 MAC：消息比特折叠成字节后查玩具 PRP（演示用） */
export function toyMacByte(k: number, bits: number[]): number {
  let acc = 0
  bits.forEach((b, i) => {
    acc = (acc ^ (b << (i % 8))) & 0xff
  })
  return toyPrp(k).enc(acc)
}

// ── AtE 反例：c = CTR(Trans(m ‖ Mac(m)))，消息为 1 比特 ──

export interface AteChallenge {
  m: 0 | 1
  bits: number[] // Trans(m ‖ tag) 编码后的比特
  c: number[] // 密文比特
  iv: number
}

export function ateEncrypt(m: 0 | 1, ke: number, km: number, iv: number): AteChallenge {
  const [a, b] = transEncode(m)
  const tag = toyMacByte(km, [m])
  const tagBits = Array.from({ length: 8 }, (_, i) => (tag >> (7 - i)) & 1)
  const bits = [a, b, ...tagBits]
  return { m, bits, c: ctrCryptBits(ke, iv, bits), iv }
}

/** 解密并验证：返回明文比特或 null（⊥） */
export function ateDecrypt(c: number[], ke: number, km: number, iv: number): 0 | 1 | null {
  const bits = ctrCryptBits(ke, iv, c)
  const m = transDecode(bits[0], bits[1])
  if (m === null) return null
  const tagBits = bits.slice(2)
  let tag = 0
  for (const b of tagBits) tag = (tag << 1) | b
  return toyMacByte(km, [m]) === tag ? m : null
}

// ── SSH 非原子解密攻击模拟 ──

export interface SshState {
  plaintext: number // 隐藏的长度值 l（敌手要恢复的）
  sent: number
  macError: boolean
}

export function sshNewTarget(): SshState {
  return { plaintext: 1 + Math.floor(Math.random() * 8), sent: 0, macError: false }
}

/** 服务器行为：先解密出长度 l，逐包读取，读满 l 个后检查 MAC（必然报错） */
export function sshSendPacket(st: SshState): SshState {
  if (st.macError) return st
  const sent = st.sent + 1
  return { ...st, sent, macError: sent >= st.plaintext }
}

// ── 固定 IV 的 CTR 攻击 ──

export function fixedIvEnc(key: number, iv: number, m: number[]): number[] {
  const ks = prgStream((key * 256 + iv) >>> 0, m.length)
  return m.map((b, i) => b ^ ks[i])
}

/** 敌手恢复密钥流并预测：c* = m* ⊕ (c_q1 ⊕ m_q1) */
export function fixedIvPredict(cq1: number[], mq1: number[], mStar: number[]): number[] {
  return mStar.map((b, i) => b ^ (cq1[i] ^ mq1[i]))
}

// ── SIV：合成初始向量 ──

export function sivEncrypt(k1: number, k2: number, m: number[]): { siv: number; c: number[] } {
  const siv = toyPrp(k1).enc(m.reduce((a, b) => (a ^ b) & 0xff, m.length & 0xff))
  return { siv, c: fixedIvEnc(k2, siv, m) }
}

// ── XEX / XTS（GF(2⁸)，约减多项式 0x1b）──

/** GF(2⁸) 乘 2（xtime） */
export function xtime(x: number): number {
  const v = x << 1
  return ((x & 0x80 ? v ^ 0x1b : v) & 0xff) >>> 0
}

/** XEX：c = F_k(m ⊕ x) ⊕ x，x = F_k(I) ⊗ 2^j（扇区 I 内第 j 块） */
export function xexBlock(k: number, sector: number, j: number, m: number): number {
  const base = toyPrp(k ^ 0xa5).enc(sector & 0xff)
  let x = base
  for (let i = 0; i < j; i++) x = xtime(x)
  return toyPrp(k).enc((m ^ x) & 0xff) ^ x
}

// ── KDF ──

/** 均匀密钥扩展：F_sk(ctx‖i)，i = 0..l-1 */
export function kdfExpand(sk: number, ctx: number, l: number): number[] {
  return Array.from({ length: l }, (_, i) => toyPrp(sk ^ 0x3c).enc((ctx ^ i) & 0xff))
}

/** HKDF 提取：k = H(salt ‖ sk)（玩具哈希） */
export function hkdfExtract(salt: number, sk: number): number {
  return toyMd([salt, sk])
}

/** PBKDF：H 迭代 c 次（密钥延展） */
export function pbkdf(pwd: number, salt: number, c: number): number {
  let v = toyMd([pwd, salt])
  for (let i = 1; i < c; i++) v = toyMd([v])
  return v
}

export const hex2 = (n: number) => n.toString(16).padStart(2, '0').toUpperCase()
