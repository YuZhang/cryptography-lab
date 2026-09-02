// 古典密码学核心算法库
// 所有算法基于 26 个小写英文字母 (a=0, ..., z=25)

export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

// 英文文本中各字母的出现概率（统计值，按百分数存储）
export const ENGLISH_FREQ = [
  8.167, 1.492, 2.782, 4.253, 12.702, 2.228, 2.015, 6.094, 6.966, 0.153,
  0.772, 4.025, 2.406, 6.749, 7.507, 1.929, 0.095, 5.987, 6.327, 9.056,
  2.758, 0.978, 2.36, 0.15, 1.974, 0.074,
]

// 英文重合指数与随机文本重合指数
export const IC_ENGLISH = 0.065
export const IC_RANDOM = 1 / 26 // ≈ 0.038

/** 只保留小写字母 */
export function sanitize(text: string): string {
  return text.toLowerCase().replace(/[^a-z]/g, '')
}

const mod26 = (n: number) => ((n % 26) + 26) % 26

// ────────────────────────────────────────────────
// 凯撒 / 移位密码
// ────────────────────────────────────────────────

/** Enc_k(m) = m + k (mod 26)，逐字母处理，非字母原样保留 */
export function shiftEncrypt(text: string, k: number): string {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => {
      const i = ALPHABET.indexOf(ch)
      return i === -1 ? ch : ALPHABET[mod26(i + k)]
    })
    .join('')
}

export function shiftDecrypt(text: string, k: number): string {
  return shiftEncrypt(text, -k)
}

/** 穷举攻击：返回全部 25 个候选密钥对应的明文 */
export function bruteForceShift(cipher: string): { k: number; text: string }[] {
  const results: { k: number; text: string }[] = []
  for (let k = 1; k < 26; k++) {
    results.push({ k, text: shiftDecrypt(cipher, k) })
  }
  return results
}

// ────────────────────────────────────────────────
// 重合指数
// ────────────────────────────────────────────────

/** 统计文本中 26 个字母的出现概率 q_i */
export function letterProbabilities(text: string): number[] {
  const counts = new Array(26).fill(0)
  const clean = sanitize(text)
  for (const ch of clean) counts[ALPHABET.indexOf(ch)]++
  const n = clean.length || 1
  return counts.map((c) => c / n)
}

/** 重合指数 I = Σ q_i² ：随机挑选两个字母相同的概率 */
export function indexOfCoincidence(text: string): number {
  const clean = sanitize(text)
  const n = clean.length
  if (n < 2) return 0
  const counts = new Array(26).fill(0)
  for (const ch of clean) counts[ALPHABET.indexOf(ch)]++
  // 放回抽样的估计：Σ (count/n)²
  return counts.reduce((sum, c) => sum + (c / n) ** 2, 0)
}

/**
 * 带参数 s 的重合指数：I_s = Σ p_i · q_{i+s}
 * p 为英文频率，q 为密文频率。s 为猜测的移位密钥。
 */
export function mutualIC(cipher: string): { s: number; score: number }[] {
  const q = letterProbabilities(cipher)
  const p = ENGLISH_FREQ.map((f) => f / 100)
  const results: { s: number; score: number }[] = []
  for (let s = 0; s < 26; s++) {
    let score = 0
    for (let i = 0; i < 26; i++) {
      score += p[i] * q[mod26(i + s)]
    }
    results.push({ s, score })
  }
  return results
}

/** 用重合指数自动寻找移位密钥：I_s 最大时的 s 即为 k */
export function crackShiftByIC(cipher: string): {
  k: number
  scores: { s: number; score: number }[]
  plaintext: string
} {
  const scores = mutualIC(cipher)
  const best = scores.reduce((a, b) => (b.score > a.score ? b : a))
  return { k: best.s, scores, plaintext: shiftDecrypt(cipher, best.s) }
}

// ────────────────────────────────────────────────
// 单表替换密码
// ────────────────────────────────────────────────

/** 生成随机替换密钥：26 个字母的一个排列 */
export function randomSubstitutionKey(): string {
  const arr = ALPHABET.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

export function isValidSubstitutionKey(key: string): boolean {
  const clean = sanitize(key)
  return clean.length === 26 && new Set(clean.split('')).size === 26
}

/** 单表替换加密：a→key[0], b→key[1], ... */
export function substEncrypt(text: string, key: string): string {
  const k = sanitize(key)
  return text
    .toLowerCase()
    .split('')
    .map((ch) => {
      const i = ALPHABET.indexOf(ch)
      return i === -1 ? ch : k[i]
    })
    .join('')
}

export function substDecrypt(text: string, key: string): string {
  const k = sanitize(key)
  return text
    .toLowerCase()
    .split('')
    .map((ch) => {
      const i = k.indexOf(ch)
      return i === -1 ? ch : ALPHABET[i]
    })
    .join('')
}

/** 频率统计（按出现次数），供频率分析图表使用 */
export function letterCounts(text: string): { letter: string; count: number; pct: number }[] {
  const clean = sanitize(text)
  const counts = new Array(26).fill(0)
  for (const ch of clean) counts[ALPHABET.indexOf(ch)]++
  const n = clean.length || 1
  return ALPHABET.split('').map((letter, i) => ({
    letter,
    count: counts[i],
    pct: (counts[i] / n) * 100,
  }))
}

// ────────────────────────────────────────────────
// 维吉尼亚密码（多表移位）
// ────────────────────────────────────────────────

/** c_i = m_i + k_{i mod t} */
export function vigenereEncrypt(text: string, key: string): string {
  const k = sanitize(key)
  if (!k) return text.toLowerCase()
  let j = 0
  return text
    .toLowerCase()
    .split('')
    .map((ch) => {
      const i = ALPHABET.indexOf(ch)
      if (i === -1) return ch
      const shift = ALPHABET.indexOf(k[j % k.length])
      j++
      return ALPHABET[mod26(i + shift)]
    })
    .join('')
}

export function vigenereDecrypt(text: string, key: string): string {
  const k = sanitize(key)
  if (!k) return text.toLowerCase()
  let j = 0
  return text
    .toLowerCase()
    .split('')
    .map((ch) => {
      const i = ALPHABET.indexOf(ch)
      if (i === -1) return ch
      const shift = ALPHABET.indexOf(k[j % k.length])
      j++
      return ALPHABET[mod26(i - shift)]
    })
    .join('')
}

// ────────────────────────────────────────────────
// Kasiski 方法：寻找周期 t
// ────────────────────────────────────────────────

export interface KasiskiRepeat {
  pattern: string
  positions: number[]
  distances: number[]
}

/** 寻找密文中重复出现的三字母片段及其间距 */
export function kasiski(cipher: string, len = 3): KasiskiRepeat[] {
  const clean = sanitize(cipher)
  const seen = new Map<string, number[]>()
  for (let i = 0; i + len <= clean.length; i++) {
    const pat = clean.slice(i, i + len)
    if (!seen.has(pat)) seen.set(pat, [])
    seen.get(pat)!.push(i)
  }
  const repeats: KasiskiRepeat[] = []
  for (const [pattern, positions] of seen) {
    if (positions.length >= 2) {
      const distances: number[] = []
      for (let i = 1; i < positions.length; i++) {
        distances.push(positions[i] - positions[i - 1])
      }
      repeats.push({ pattern, positions, distances })
    }
  }
  return repeats.sort((a, b) => b.positions.length - a.positions.length)
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

export function gcdAll(nums: number[]): number {
  return nums.reduce((acc, n) => gcd(acc, n))
}

// ────────────────────────────────────────────────
// 重合指数法：寻找周期 t，并逐列破解密钥
// ────────────────────────────────────────────────

/** 取密文中以 τ 为间隔的字符集合 c_j, c_{j+τ}, ...（起始偏移 offset） */
export function everyNth(cipher: string, tau: number, offset: number): string {
  const clean = sanitize(cipher)
  let out = ''
  for (let i = offset; i < clean.length; i += tau) out += clean[i]
  return out
}

/** 对每个候选周期 τ，计算间隔字符集合的重合指数（对各偏移取平均） */
export function icByPeriod(cipher: string, maxTau = 16): { tau: number; ic: number }[] {
  const results: { tau: number; ic: number }[] = []
  for (let tau = 1; tau <= maxTau; tau++) {
    let sum = 0
    for (let off = 0; off < tau; off++) {
      sum += indexOfCoincidence(everyNth(cipher, tau, off))
    }
    results.push({ tau, ic: sum / tau })
  }
  return results
}

/** 已知周期 t，逐列用重合指数破解每个密钥字母 */
export function crackVigenere(cipher: string, t: number): {
  key: string
  plaintext: string
  columnKeys: number[]
} {
  const columnKeys: number[] = []
  for (let off = 0; off < t; off++) {
    const column = everyNth(cipher, t, off)
    columnKeys.push(crackShiftByIC(column).k)
  }
  const key = columnKeys.map((k) => ALPHABET[k]).join('')
  return { key, plaintext: vigenereDecrypt(cipher, key), columnKeys }
}
