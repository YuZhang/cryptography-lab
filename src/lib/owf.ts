// 伪随机对象理论构造教学库：单向函数、核心断言、Blum-Micali PRG、
// GGM 树（PRG→PRF）、Luby-Rackoff 轮数实验
// 仅为演示原理，无任何真实安全性

import { xorshift32 } from './prg'

// ── 小工具 ──

export function parity(x: number): number {
  let p = 0
  while (x) {
    p ^= x & 1
    x >>>= 1
  }
  return p
}

/** n 比特上的带密钥玩具排列（OWP 教具）：Fisher-Yates 洗牌 */
export function toyOwp(nbits: number, seed: number): { f: (x: number) => number; finv: (y: number) => number } {
  const size = 1 << nbits
  const perm = Array.from({ length: size }, (_, i) => i)
  const rnd = xorshift32(seed)
  for (let i = size - 1; i > 0; i--) {
    const j = rnd() % (i + 1)
    ;[perm[i], perm[j]] = [perm[j], perm[i]]
  }
  const inv = new Array(size)
  for (let i = 0; i < size; i++) inv[perm[i]] = i
  const mask = size - 1
  return { f: (x) => perm[x & mask], finv: (y) => inv[y & mask] }
}

// ── 候选单向函数（求逆实验游戏）──

/** 小素数表（筛法） */
export function smallPrimes(upto: number): number[] {
  const sieve = new Array(upto + 1).fill(true)
  sieve[0] = sieve[1] = false
  for (let i = 2; i * i <= upto; i++)
    if (sieve[i]) for (let j = i * i; j <= upto; j += i) sieve[j] = false
  const primes: number[] = []
  for (let i = 2; i <= upto; i++) if (sieve[i]) primes.push(i)
  return primes
}

export interface MultChallenge {
  p: number
  q: number
  n: number
}

/** 乘法单向函数挑战：n = p·q，p、q 为 bits 比特素数 */
export function multChallenge(bits: number): MultChallenge {
  const lo = 1 << (bits - 1)
  const hi = 1 << bits
  const primes = smallPrimes(hi).filter((p) => p >= lo)
  const pick = () => primes[Math.floor(Math.random() * primes.length)]
  const p = pick()
  let q = pick()
  while (q === p) q = pick()
  return { p, q, n: p * q }
}

// ── 核心断言（HCP）──

/** Goldreich-Levin：gl(x, r) = ⊕ xᵢ·rᵢ */
export function glPredicate(x: number, r: number): number {
  return parity(x & r)
}

/**
 * 反例 OWF：f'(x) 的最低位直接泄露 ⊕xᵢ。
 * 对朴素断言 hc(x)=⊕xᵢ，敌手从输出最后 1 比特直接读出答案。
 */
export function leakyOwf(x: number, nbits: number): number {
  const mask = (1 << nbits) - 1
  return ((x >>> 1) << 1 | parity(x & mask)) & mask
}

// ── Blum-Micali PRG ──

export interface BmStep {
  state: number
  outBit: number
}

/** Blum-Micali：s → f(s) → f²(s) → …，每步输出 hc(当前状态) */
export function blumMicali(
  seed: number,
  steps: number,
  owp: { f: (x: number) => number },
  hc: (x: number) => number
): BmStep[] {
  const out: BmStep[] = []
  let s = seed
  for (let i = 0; i < steps; i++) {
    out.push({ state: s, outBit: hc(s) })
    s = owp.f(s)
  }
  return out
}

// ── GGM 树：PRG(2n 扩展) → PRF ──

/** 玩具倍增 PRG：n 比特种子 → 2n 比特，拆成左右两半 */
export function toyDoublingPrg(seed: number, nbits: number): [number, number] {
  const rnd = xorshift32(seed + 1)
  const mask = (1 << nbits) - 1
  return [rnd() & mask, rnd() & mask]
}

export interface GgmNode {
  level: number
  index: number // 该层第几个节点（0 起）
  value: number
}

/** 生成 depth 层 GGM 二叉树（level 0 为根 = 密钥） */
export function ggmTree(key: number, depth: number, nbits: number): GgmNode[][] {
  const levels: GgmNode[][] = [[{ level: 0, index: 0, value: key }]]
  for (let d = 1; d <= depth; d++) {
    const prev = levels[d - 1]
    const row: GgmNode[] = []
    for (const node of prev) {
      const [g0, g1] = toyDoublingPrg(node.value, nbits)
      row.push({ level: d, index: node.index * 2, value: g0 })
      row.push({ level: d, index: node.index * 2 + 1, value: g1 })
    }
    levels.push(row)
  }
  return levels
}

/** 输入比特串对应的叶子路径：x=011 → G₁(G₁(G₀(k)))，0 左 1 右 */
export function ggmPath(key: number, bits: string, nbits: number): GgmNode[] {
  const path: GgmNode[] = [{ level: 0, index: 0, value: key }]
  let node = path[0]
  for (let i = 0; i < bits.length; i++) {
    const [g0, g1] = toyDoublingPrg(node.value, nbits)
    const goRight = bits[i] === '1'
    node = { level: i + 1, index: node.index * 2 + (goRight ? 1 : 0), value: goRight ? g1 : g0 }
    path.push(node)
  }
  return path
}

// ── Luby-Rackoff 轮数实验（8 比特分组 = 4+4，轮函数为玩具 PRF）──

/** 玩具 PRF 轮函数：f_k(r) = 4 比特 */
export function lrRoundF(r: number, k: number): number {
  const rnd = xorshift32((r + 1) * 0x9e37 + k * 0x85eb)
  return rnd() & 0xf
}

/** rounds 轮 Feistel 加密（8 比特输入），轮密钥由主密钥派生 */
export function lrEncrypt(input: number, master: number, rounds: number): number {
  let l = (input >>> 4) & 0xf
  let r = input & 0xf
  for (let i = 0; i < rounds; i++) {
    const k = (master + i * 0x3d) & 0xffff
    const f = lrRoundF(r, k)
    const nl = r
    const nr = l ^ f
    l = nl
    r = nr
  }
  return ((l << 4) | r) & 0xff
}

/** 8 比特上的真随机排列（对照组） */
export function randomPerm8(seed: number): (x: number) => number {
  const perm = Array.from({ length: 256 }, (_, i) => i)
  const rnd = xorshift32(seed)
  for (let i = 255; i > 0; i--) {
    const j = rnd() % (i + 1)
    ;[perm[i], perm[j]] = [perm[j], perm[i]]
  }
  return (x) => perm[x & 0xff]
}

export const hex2 = (n: number) => n.toString(16).padStart(2, '0').toUpperCase()
export const bin8 = (n: number) => n.toString(2).padStart(8, '0')
