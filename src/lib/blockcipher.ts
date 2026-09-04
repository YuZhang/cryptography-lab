// 块密码教学演示库：16 比特玩具 SPN、雪崩效应、Feistel 网络、
// 中间相遇攻击、S 盒线性/差分分析
// 仅为演示原理，无任何真实安全性

import { toyPrp } from './toycipher'

/** Heys 教学 S 盒（4→4 比特），讲义线性/差分分析同款：S(0)=E */
export const HEYS_SBOX = [
  0xe, 0x4, 0xd, 0x1, 0x2, 0xf, 0xb, 0x8, 0x3, 0xa, 0x6, 0xc, 0x5, 0x9, 0x0, 0x7,
]

/** 对比用的"坏 S 盒"：恒等替换——完全线性，无混淆 */
export const IDENTITY_SBOX = Array.from({ length: 16 }, (_, i) => i)

export function invertSbox(sbox: number[]): number[] {
  const inv = new Array(16)
  for (let i = 0; i < 16; i++) inv[sbox[i]] = i
  return inv
}

/** 4 比特奇偶校验（线性分析用） */
export function parity4(x: number): number {
  let p = 0
  for (let i = 0; i < 4; i++) p ^= (x >> i) & 1
  return p
}

// ── 玩具 SPN：16 比特分组，4 个 4 比特 S 盒，P 盒为比特转置 ──

/** P 盒：S 盒 j 的第 i 比特 → 第 i 组的第 j 比特（比特转置，扩散到不同 S 盒） */
export function pbox16(x: number): number {
  let y = 0
  for (let j = 0; j < 4; j++)
    for (let i = 0; i < 4; i++) if ((x >> (j * 4 + i)) & 1) y |= 1 << (i * 4 + j)
  return y
}

export function pbox16Inv(y: number): number {
  return pbox16(y) // 转置的逆还是转置
}

/** 对 16 比特状态逐组过 S 盒 */
export function sboxLayer(x: number, sbox: number[]): number {
  let y = 0
  for (let j = 0; j < 4; j++) y |= sbox[(x >> (j * 4)) & 0xf] << (j * 4)
  return y
}

/** 演示用密钥编排：主密钥每轮循环左移 4 位 */
export function roundKey(master: number, round: number): number {
  const r = (round * 4) % 16
  return ((master << r) | (master >>> (16 - r))) & 0xffff
}

export interface SpnStage {
  label: string
  state: number
}

/**
 * 玩具 SPN 加密，返回每一阶段的中间状态。
 * 每轮：密钥混合 → S 盒 → P 盒；最后一轮无 P 盒，改为末尾密钥混合。
 * finalMixing=false 时去掉末尾密钥混合（演示该弱点）。
 */
export function spnEncryptTraced(
  input: number,
  master: number,
  rounds: number,
  sbox: number[] = HEYS_SBOX,
  finalMixing = true
): SpnStage[] {
  const stages: SpnStage[] = [{ label: '明文', state: input & 0xffff }]
  let x = input & 0xffff
  for (let r = 0; r < rounds; r++) {
    const last = r === rounds - 1
    x ^= roundKey(master, r)
    stages.push({ label: `第 ${r + 1} 轮 · 密钥混合`, state: x })
    x = sboxLayer(x, sbox)
    stages.push({ label: `第 ${r + 1} 轮 · S 盒替换`, state: x })
    if (!last) {
      x = pbox16(x)
      stages.push({ label: `第 ${r + 1} 轮 · P 盒置换`, state: x })
    }
  }
  if (finalMixing) {
    x ^= roundKey(master, rounds)
    stages.push({ label: '末尾密钥混合', state: x })
  }
  stages[stages.length - 1].label += ' ⇒ 密文'
  return stages
}

export function spnEncrypt(
  input: number,
  master: number,
  rounds: number,
  sbox: number[] = HEYS_SBOX,
  finalMixing = true
): number {
  const stages = spnEncryptTraced(input, master, rounds, sbox, finalMixing)
  return stages[stages.length - 1].state
}

/** 翻转 input 的第 bit 位后逐阶段对比，返回每个阶段不同的比特数 */
export function avalancheByStage(
  input: number,
  bit: number,
  master: number,
  rounds: number,
  sbox: number[] = HEYS_SBOX
): { label: string; diff: number }[] {
  const a = spnEncryptTraced(input, master, rounds, sbox)
  const b = spnEncryptTraced(input ^ (1 << bit), master, rounds, sbox)
  return a.map((s, i) => ({
    label: s.label,
    diff: popcount16(s.state ^ b[i].state),
  }))
}

export function popcount16(x: number): number {
  let c = 0
  for (let i = 0; i < 16; i++) c += (x >> i) & 1
  return c
}

/** 严格雪崩条件采样：随机 samples 个明文翻转第 bit 位，统计输出变化比特数分布 */
export function sacSample(
  bit: number,
  master: number,
  rounds: number,
  samples: number,
  sbox: number[] = HEYS_SBOX,
  rng: () => number = Math.random
): number[] {
  const hist = new Array(17).fill(0)
  for (let t = 0; t < samples; t++) {
    const x = Math.floor(rng() * 0x10000)
    const d = spnEncrypt(x, master, rounds, sbox) ^ spnEncrypt(x ^ (1 << bit), master, rounds, sbox)
    hist[popcount16(d)]++
  }
  return hist
}

// ── Feistel 网络 ──

export type FeistelKind = 'zero' | 'identity' | 'and' | 'sbox'

export const FEISTEL_INFO: Record<FeistelKind, { name: string; invertible: boolean; desc: string }> = {
  zero: { name: '零函数 f(x)=0', invertible: false, desc: '无论输入什么都输出 0——完全不可逆' },
  identity: { name: '恒等函数 f(x)=x', invertible: true, desc: '输出等于输入' },
  and: { name: '按位与 f(x)=x∧k', invertible: false, desc: '信息被抹掉，单向' },
  sbox: { name: 'S 盒查表 f(x)=S(x⊕k)', invertible: true, desc: '查 Heys S 盒' },
}

/** 4 比特轮函数；k 为 4 比特子密钥 */
export function feistelF(kind: FeistelKind, x: number, k: number): number {
  switch (kind) {
    case 'zero':
      return 0
    case 'identity':
      return x & 0xf
    case 'and':
      return x & k & 0xf
    case 'sbox':
      return HEYS_SBOX[(x ^ k) & 0xf]
  }
}

/** 演示用子密钥 */
export function feistelRoundKey(master: number, round: number): number {
  return (master + round * 7) & 0xf
}

export interface FeistelStage {
  label: string
  l: number
  r: number
}

/** r 轮 Feistel 加密（4+4 比特），逐步返回状态 */
export function feistelEncryptTraced(
  l0: number,
  r0: number,
  master: number,
  rounds: number,
  kind: FeistelKind
): FeistelStage[] {
  const stages: FeistelStage[] = [{ label: '输入 (L₀, R₀)', l: l0 & 0xf, r: r0 & 0xf }]
  let l = l0 & 0xf
  let r = r0 & 0xf
  for (let i = 1; i <= rounds; i++) {
    const f = feistelF(kind, r, feistelRoundKey(master, i))
    const nl = r
    const nr = l ^ f
    l = nl
    r = nr
    stages.push({ label: `第 ${i} 轮`, l, r })
  }
  return stages
}

/** Feistel 解密：L_{i-1} = R_i ⊕ f_i(L_i)，R_{i-1} = L_i */
export function feistelDecryptTraced(
  lr: number,
  rr: number,
  master: number,
  rounds: number,
  kind: FeistelKind
): FeistelStage[] {
  const stages: FeistelStage[] = [{ label: '密文 (Lᵣ, Rᵣ)', l: lr & 0xf, r: rr & 0xf }]
  let l = lr & 0xf
  let r = rr & 0xf
  for (let i = rounds; i >= 1; i--) {
    const f = feistelF(kind, l, feistelRoundKey(master, i))
    const pl = r ^ f
    const pr = l
    l = pl
    r = pr
    stages.push({ label: `倒推第 ${i} 轮`, l, r })
  }
  return stages
}

// ── 中间相遇攻击（双重加密）──

export interface MitmResult {
  x: number
  y: number
  k1: number
  k2: number
  z0: number
  candidates: [number, number][]
  survivor: [number, number] | null
}

/** 玩具双重加密 MITM：n=8 比特密钥，字节分组。用第二对明密文筛选候选密钥对。 */
export function mitmDemo(x: number, x2: number): MitmResult {
  const k1 = Math.floor(Math.random() * 256)
  const k2 = Math.floor(Math.random() * 256)
  const f1 = toyPrp(k1)
  const f2 = toyPrp(k2)
  const y = f2.enc(f1.enc(x))
  const y2 = f2.enc(f1.enc(x2))

  const forward = new Map<number, number[]>() // z → 所有满足 F_k(x)=z 的 k
  for (let k = 0; k < 256; k++) {
    const z = toyPrp(k).enc(x)
    const arr = forward.get(z) ?? []
    arr.push(k)
    forward.set(z, arr)
  }
  const candidates: [number, number][] = []
  let z0 = -1
  for (let k = 0; k < 256; k++) {
    const z = toyPrp(k).dec(y)
    const hits = forward.get(z)
    if (hits) {
      if (z0 === -1) z0 = z
      for (const a of hits) candidates.push([a, k])
    }
  }
  const survivor =
    candidates.find(([a, b]) => toyPrp(b).enc(toyPrp(a).enc(x2)) === y2) ?? null
  return { x, y, k1, k2, z0, candidates, survivor }
}

// ── S 盒线性分析（LAT）与差分分析（DDT）──

/** 线性近似表：lat[a][b] = |{x : ⟨a,x⟩ = ⟨b,S(x)⟩}| − 8（偏差） */
export function linearApproxTable(sbox: number[] = HEYS_SBOX): number[][] {
  const lat = Array.from({ length: 16 }, () => new Array(16).fill(0))
  for (let a = 0; a < 16; a++)
    for (let b = 0; b < 16; b++) {
      let cnt = 0
      for (let x = 0; x < 16; x++)
        if (parity4(a & x) === parity4(b & sbox[x])) cnt++
      lat[a][b] = cnt - 8
    }
  return lat
}

/** 差分分布表：ddt[dx][dy] = |{x : S(x)⊕S(x⊕dx) = dy}| */
export function diffDistTable(sbox: number[] = HEYS_SBOX): number[][] {
  const ddt = Array.from({ length: 16 }, () => new Array(16).fill(0))
  for (let dx = 0; dx < 16; dx++)
    for (let x = 0; x < 16; x++) ddt[dx][sbox[x] ^ sbox[x ^ dx]]++
  return ddt
}

/** 单个 (a,b) 掩码的命中次数与概率 */
export function latEntry(a: number, b: number, sbox: number[] = HEYS_SBOX) {
  let cnt = 0
  for (let x = 0; x < 16; x++) if (parity4(a & x) === parity4(b & sbox[x])) cnt++
  return { count: cnt, bias: cnt - 8, prob: cnt / 16 }
}

/** 给定 ΔX 时 ΔY 的分布 */
export function ddtRow(dx: number, sbox: number[] = HEYS_SBOX): number[] {
  return diffDistTable(sbox)[dx]
}

export const hex1 = (n: number) => n.toString(16).toUpperCase()
export const bin4 = (n: number) => n.toString(2).padStart(4, '0')
export const hex4 = (n: number) => n.toString(16).padStart(4, '0').toUpperCase()
