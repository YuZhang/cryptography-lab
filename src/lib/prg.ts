// 伪随机性演示工具：玩具 PRG、统计测试、种子空间蛮力
// 注意：xorshift32 仅用于教学演示，不是密码学安全的 PRG

/** xorshift32 玩具伪随机生成器（演示用） */
export function xorshift32(seed: number): () => number {
  let s = seed >>> 0 || 0x9e3779b9
  return () => {
    s ^= s << 13
    s >>>= 0
    s ^= s >> 17
    s ^= s << 5
    s >>>= 0
    return s >>> 0
  }
}

/** 以 seed 为种子生成 nbytes 字节的伪随机流 */
export function prgStream(seed: number, nbytes: number): number[] {
  const next = xorshift32(seed)
  const out: number[] = []
  while (out.length < nbytes) {
    const w = next()
    out.push(w & 0xff, (w >> 8) & 0xff, (w >> 16) & 0xff, (w >>> 24) & 0xff)
  }
  return out.slice(0, nbytes)
}

/** 把短字符串（密钥）折叠成 32 比特种子 */
export function seedFromString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// ── 统计测试演示 ──

export type GenKind = 'crypto' | 'biased' | 'lcg-lowbit'

export const GEN_INFO: Record<GenKind, { name: string; desc: string }> = {
  crypto: {
    name: '密码学安全随机源',
    desc: 'crypto.getRandomValues()，操作系统级真随机性',
  },
  biased: {
    name: '偏差源（ Pr[1] = 0.7 ）',
    desc: '每个比特以 0.7 概率为 1——分布有偏',
  },
  'lcg-lowbit': {
    name: 'LCG 取最低位',
    desc: '线性同余生成器的最低比特——看似均衡，实则逐位交替，完全可预测',
  },
}

/** 生成 n 个比特 */
export function genBits(kind: GenKind, n: number): number[] {
  if (kind === 'crypto') {
    const bytes = new Uint8Array(Math.ceil(n / 8))
    crypto.getRandomValues(bytes)
    const bits: number[] = []
    for (const b of bytes) for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1)
    return bits.slice(0, n)
  }
  if (kind === 'biased') {
    return Array.from({ length: n }, () => (Math.random() < 0.7 ? 1 : 0))
  }
  // LCG 最低位：经典弱点——最低比特逐位交替
  let state = (Date.now() % 2147483647) >>> 0
  const bits: number[] = []
  for (let i = 0; i < n; i++) {
    state = (Math.imul(state, 1103515245) + 12345) % 2147483648
    bits.push(state & 1)
  }
  return bits
}

export interface BitStats {
  ones: number
  zeros: number
  balance: number // |#1 - #0| / n，越小越均衡
  longestRun: number // 最长连续相同比特
}

export function bitStats(bits: number[]): BitStats {
  const ones = bits.reduce((s, b) => s + b, 0)
  const n = bits.length
  let longest = 0
  let run = 1
  for (let i = 1; i < n; i++) {
    if (bits[i] === bits[i - 1]) {
      run++
      longest = Math.max(longest, run)
    } else {
      run = 1
    }
  }
  longest = Math.max(longest, run)
  return {
    ones,
    zeros: n - ones,
    balance: Math.abs(ones - (n - ones)) / n,
    longestRun: longest,
  }
}
