// 教学演示用玩具密码：玩具 PRP、单块 CBC、PKCS 填充预言机攻击、像素模式实验
// 仅为演示原理，无任何真实安全性

import { xorshift32 } from './prg'

/** 玩具分组密码：字节集合 {0..255} 上的带密钥置换 */
export function toyPrp(seed: number): { enc: (x: number) => number; dec: (y: number) => number } {
  const perm = Array.from({ length: 256 }, (_, i) => i)
  const rnd = xorshift32(seed)
  for (let i = 255; i > 0; i--) {
    const j = rnd() % (i + 1)
    ;[perm[i], perm[j]] = [perm[j], perm[i]]
  }
  const inv = new Array(256)
  for (let i = 0; i < 256; i++) inv[perm[i]] = i
  return { enc: (x) => perm[x & 0xff], dec: (y) => inv[y & 0xff] }
}

export const BLOCK = 8

/** 单块 CBC 加密：C1 = F(IV ⊕ P)，P 为 PKCS 填充后的一个分组 */
export function cbcEncryptBlock(prp: { enc: (x: number) => number }, iv: number[], p: number[]): number[] {
  return p.map((b, i) => prp.enc(b ^ iv[i]))
}

export function cbcDecryptBlock(prp: { dec: (y: number) => number }, iv: number[], c: number[]): number[] {
  return c.map((b, i) => prp.dec(b) ^ iv[i])
}

/** PKCS 填充：消息长度 len（0..BLOCK-1），填充 b = BLOCK - len 个字节的 b；len=0 时为哑块 */
export function pkcsPad(msg: number[]): number[] {
  const b = BLOCK - msg.length
  return [...msg, ...Array(b).fill(b)]
}

export function pkcsPaddingValid(p: number[]): boolean {
  const b = p[BLOCK - 1]
  if (b < 1 || b > BLOCK) return false
  for (let i = BLOCK - b; i < BLOCK; i++) if (p[i] !== b) return false
  return true
}

export interface AttackLog {
  pos: number
  padVal: number
  queries: number
  recovered: number
}

/** 填充预言机攻击：逐字节恢复单个分组的明文，返回日志与明文 */
export function paddingOracleAttack(
  prp: { dec: (y: number) => number },
  iv: number[],
  c: number[]
): { plaintext: number[]; logs: AttackLog[]; totalQueries: number } {
  const oracle = (iv2: number[]) => pkcsPaddingValid(cbcDecryptBlock(prp, iv2, c))
  const p = new Array(BLOCK).fill(0)
  const logs: AttackLog[] = []
  let totalQueries = 0

  for (let pos = BLOCK - 1; pos >= 0; pos--) {
    const padVal = BLOCK - pos
    const iv2 = [...iv]
    // 已知后缀：调整使解密后后缀等于 padVal
    for (let j = pos + 1; j < BLOCK; j++) {
      iv2[j] = iv[j] ^ p[j] ^ padVal
    }
    let found = -1
    let queries = 0
    for (let u = 0; u < 256; u++) {
      iv2[pos] = u
      queries++
      totalQueries++
      if (oracle(iv2)) {
        // 排除"恰好是更长填充"的假阳性：改动前一个字节，填充应仍然有效
        if (pos > 0) {
          const iv3 = [...iv2]
          iv3[pos - 1] ^= 1
          if (!oracle(iv3)) continue
        }
        found = u
        break
      }
    }
    if (found === -1) break
    p[pos] = iv[pos] ^ found ^ padVal
    logs.push({ pos, padVal, queries, recovered: p[pos] })
  }
  return { plaintext: p, logs, totalQueries }
}

// ── 操作模式像素实验 ──

export const PIX = 32

/** 生成 32×32 的小企鹅像素图，像素值 0..3 */
export function penguinBitmap(): number[] {
  const px = new Array(PIX * PIX).fill(0)
  const set = (x: number, y: number, v: number) => {
    if (x >= 0 && x < PIX && y >= 0 && y < PIX) px[y * PIX + x] = v
  }
  for (let y = 0; y < PIX; y++) {
    for (let x = 0; x < PIX; x++) {
      // 身体（深色椭圆）
      if (((x - 16) / 9) ** 2 + ((y - 17) / 11) ** 2 < 1) set(x, y, 2)
      // 肚皮（浅色椭圆）
      if (((x - 16) / 5.5) ** 2 + ((y - 19) / 7) ** 2 < 1) set(x, y, 1)
      // 眼睛
      if ((x - 12.5) ** 2 + (y - 10.5) ** 2 < 1.8) set(x, y, 3)
      if ((x - 19.5) ** 2 + (y - 10.5) ** 2 < 1.8) set(x, y, 3)
    }
  }
  return px
}

/** {0,1,2,3} 上的带密钥置换（玩具分组密码，分组 = 1 像素） */
export function pixelPrp(key: number): (x: number) => number {
  const perm = [0, 1, 2, 3]
  const rnd = xorshift32(key)
  for (let i = 3; i > 0; i--) {
    const j = rnd() % (i + 1)
    ;[perm[i], perm[j]] = [perm[j], perm[i]]
  }
  return (x) => perm[x & 3]
}

/** ECB：逐块独立加密 */
export function ecbEncrypt(px: number[], prp: (x: number) => number): number[] {
  return px.map((p) => prp(p))
}

/** CBC：c_i = F(p_i ⊕ c_{i-1})，c_{-1} = IV */
export function cbcEncrypt(px: number[], prp: (x: number) => number, iv: number): number[] {
  let prev = iv & 3
  return px.map((p) => {
    const c = prp(p ^ prev)
    prev = c
    return c
  })
}

/** CTR：c_i = p_i ⊕ stream_i */
export function ctrEncrypt(px: number[], key: number, ctr: number): number[] {
  const rnd = xorshift32(key ^ ctr)
  return px.map((p) => p ^ (rnd() & 3))
}
