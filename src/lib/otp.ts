// 一次一密（OTP）相关工具：字节级操作

export function textToBytes(text: string): number[] {
  return Array.from(new TextEncoder().encode(text))
}

export function bytesToHex(bytes: number[]): string {
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ')
}

export function bytesToText(bytes: number[]): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes))
  } catch {
    return bytesToHex(bytes) // 不是合法 UTF-8 时显示十六进制
  }
}

export function xorBytes(a: number[], b: number[]): number[] {
  const n = Math.min(a.length, b.length)
  return Array.from({ length: n }, (_, i) => a[i] ^ b[i])
}

export function randomBytes(n: number): number[] {
  const arr = new Uint8Array(n)
  crypto.getRandomValues(arr)
  return Array.from(arr)
}

export function byteToBits(b: number): string {
  return b.toString(2).padStart(8, '0')
}
