import { useEffect, useMemo, useState } from 'react'
import { Dices, Flame, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { byteToBits, bytesToHex, bytesToText, randomBytes, textToBytes, xorBytes } from '@/lib/otp'
import { Formula, Section } from '../shared'

function HexRow({ label, hex, tone }: { label: string; hex: string; tone?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <div className={`break-all rounded-lg border border-border bg-muted/60 p-3 font-mono text-xs leading-relaxed ${tone ?? 'text-foreground'}`}>
        {hex || '…'}
      </div>
    </div>
  )
}

export default function PsOtp() {
  const [m0, setM0] = useState('attack at dawn')
  const [m1, setM1] = useState('retreat at noon')
  const [key, setKey] = useState<number[]>(() => randomBytes(14))

  const b0 = useMemo(() => textToBytes(m0), [m0])
  const b1 = useMemo(() => textToBytes(m1), [m1])
  const n = Math.max(b0.length, b1.length, 1)

  // 密钥必须与明文等长：长度变化时重新生成（在 effect 中，避免渲染期反复重掷）
  useEffect(() => {
    setKey((prev) => (prev.length === n ? prev : randomBytes(n)))
  }, [n])
  const k = key.length === n ? key : key.concat(randomBytes(n - key.length)).slice(0, n)

  const c0 = xorBytes(b0, k)
  const c1 = xorBytes(b1, k)
  const xorCC = xorBytes(c0, c1)
  const xorMM = xorBytes(b0, b1)

  // 第一个字节的比特级异或展示
  const firstByte = b0[0] ?? 0
  const firstKey = k[0] ?? 0
  const firstCipher = c0[0] ?? 0

  return (
    <Section
      id="ps-otp"
      index="02 · 构造与事故"
      title="一次一密 One-Time Pad"
      subtitle="Vernam 的构造：明文比特串与等长的随机密钥逐位异或。它是完美保密的——但名字里的「一次」是铁律，用两次就是灾难。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* OTP 加密 */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <KeyRound className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> 动手加密
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>c = m ⊕ k ， m = c ⊕ k</Formula>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">明文 m</label>
              <Input
                value={m0}
                onChange={(e) => setM0(e.target.value)}
                className="border-input bg-background font-mono text-foreground"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                密钥 k（{n} 字节，与明文等长）
              </span>
              <Button
                size="sm"
                variant="outline"
                className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                onClick={() => setKey(randomBytes(n))}
              >
                <Dices className="mr-1 h-4 w-4" /> 重新掷一个密钥
              </Button>
            </div>
            <HexRow label="密钥 k（hex）" hex={bytesToHex(k)} tone="text-emerald-700 dark:text-emerald-300" />
            <HexRow label="密文 c = m ⊕ k（hex）" hex={bytesToHex(c0)} tone="text-amber-700 dark:text-amber-300" />
            <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
              <div className="text-muted-foreground">逐位异或（首字节 '{m0[0] ?? ''}'）：</div>
              <div className="mt-1 space-y-0.5">
                <div>m: {byteToBits(firstByte)}</div>
                <div>k: {byteToBits(firstKey)}</div>
                <div className="text-amber-700 dark:text-amber-300">c: {byteToBits(firstCipher)}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              多点几次「重新掷密钥」：同一明文每次加密成完全不同的密文，且每个密文等概出现——
              这正是 Pr[C=c | M=m] = Pr[C=c]，密文与明文「脱钩」。美苏之间的「红色热线」就曾用一次一密保护。
            </p>
          </CardContent>
        </Card>

        {/* 二次加密灾难 */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Flame className="h-5 w-5 text-red-600 dark:text-red-400" /> 事故：密钥用了第二次
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>c ⊕ c′ = (m ⊕ k) ⊕ (m′ ⊕ k) = m ⊕ m′</Formula>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">明文 m′（用同一密钥加密）</label>
              <Input
                value={m1}
                onChange={(e) => setM1(e.target.value)}
                className="border-input bg-background font-mono text-foreground"
              />
            </div>
            <HexRow label="密文 c′（hex）" hex={bytesToHex(c1)} tone="text-amber-700 dark:text-amber-300" />
            <HexRow
              label="敌手计算 c ⊕ c′（hex）"
              hex={bytesToHex(xorCC)}
              tone="text-red-600 dark:text-red-400"
            />
            <HexRow label="= m ⊕ m′（逐字节对照）" hex={bytesToHex(xorMM)} tone="text-red-600 dark:text-red-400" />
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-700 dark:text-red-300">
              密钥 k 被异或消掉了！两段密文的异或 = 两段明文的异或，不再完美保密。
              结合上一讲的自然语言统计模式（如空格频率、crib 猜测）即可逐步还原明文。
            </div>
            <p className="text-xs text-muted-foreground">
              真实案例：MS-PPTP 协议曾用同一密钥加密双向通信的两个消息；
              改进方法是每个方向各用一个密钥。可解出的明文示例：
              {bytesToText(xorBytes(c0, k)) && ` c 解密 → "${bytesToText(xorBytes(c0, k))}"`}
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
