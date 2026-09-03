import { useState } from 'react'
import { RotateCcw, Send, Swords, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { bytesToHex, randomBytes, textToBytes, xorBytes } from '@/lib/otp'
import { Section } from '../shared'
import { cn } from '@/lib/utils'

type Scheme = 'otp' | 'lsb'
type Phase = 'idle' | 'challenged' | 'revealed'

interface Challenge {
  b: 0 | 1
  cipherHex: string
  lsb: number | null
}

export default function PsGame() {
  const [scheme, setScheme] = useState<Scheme>('otp')
  const [m0, setM0] = useState('attack')
  const [m1, setM1] = useState('retrea')
  const [phase, setPhase] = useState<Phase>('idle')
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [guess, setGuess] = useState<0 | 1 | null>(null)
  const [rounds, setRounds] = useState(0)
  const [wins, setWins] = useState(0)

  const b0 = textToBytes(m0)
  const b1 = textToBytes(m1)
  const valid = m0.length > 0 && b0.length === b1.length
  const lsbDiffer = (b0[b0.length - 1] ?? 0) % 2 !== (b1[b1.length - 1] ?? 0) % 2

  function startChallenge() {
    if (!valid) return
    const b = (Math.random() < 0.5 ? 0 : 1) as 0 | 1
    const m = b === 0 ? b0 : b1
    const key = randomBytes(m.length)
    const c = xorBytes(m, key)
    const lsb = scheme === 'lsb' ? m[m.length - 1] % 2 : null
    setChallenge({ b, cipherHex: bytesToHex(c), lsb })
    setGuess(null)
    setPhase('challenged')
  }

  function makeGuess(g: 0 | 1) {
    if (phase !== 'challenged') return
    setGuess(g)
    setRounds((r) => r + 1)
    if (challenge && g === challenge.b) setWins((w) => w + 1)
    setPhase('revealed')
  }

  function reset() {
    setPhase('idle')
    setChallenge(null)
    setGuess(null)
    setRounds(0)
    setWins(0)
  }

  const rate = rounds > 0 ? wins / rounds : null

  return (
    <Section
      id="ps-game"
      index="04 · 思想实验"
      title="窃听不可区分实验：你来当 Eve"
      subtitle="密码学中最重要的思想实验。你是敌手：选两个等长明文交给挑战者；挑战者掷硬币选一个、用新密钥加密后发回密文；你猜他选了哪个。完美保密 ⟺ 你的胜率永远只是 1/2——不比瞎猜强。"
    >
      <div className="grid gap-6 lg:grid-cols-5">
        {/* 实验台 */}
        <Card className="border-border bg-card/60 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Swords className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> 实验台
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 方案选择 */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setScheme('otp')
                  reset()
                }}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm transition-colors',
                  scheme === 'otp'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border-border text-muted-foreground hover:border-emerald-500/40'
                )}
              >
                一次一密（完美保密）
              </button>
              <button
                onClick={() => {
                  setScheme('lsb')
                  reset()
                }}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm transition-colors',
                  scheme === 'lsb'
                    ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                    : 'border-border text-muted-foreground hover:border-red-500/40'
                )}
              >
                缺陷方案：Encₖ(m) ∥ LSB(m)
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">明文 m₀</label>
                <Input
                  value={m0}
                  onChange={(e) => setM0(e.target.value)}
                  className="border-input bg-background font-mono text-foreground"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">明文 m₁（等长）</label>
                <Input
                  value={m1}
                  onChange={(e) => setM1(e.target.value)}
                  className="border-input bg-background font-mono text-foreground"
                />
              </div>
            </div>
            {!valid && (
              <p className="text-xs text-red-600 dark:text-red-400">
                两个明文必须等长（当前 {b0.length} vs {b1.length} 字节）
              </p>
            )}
            {scheme === 'lsb' && valid && (
              <p className="text-xs text-muted-foreground">
                LSB(m₀) = {b0[b0.length - 1] % 2}，LSB(m₁) = {b1[b1.length - 1] % 2}
                {lsbDiffer
                  ? ' —— 不同！你有必胜策略。'
                  : ' —— 相同，换个明文让末位比特不同试试。'}
              </p>
            )}

            <Button
              onClick={startChallenge}
              disabled={!valid || phase === 'challenged'}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Send className="mr-1 h-4 w-4" />
              {phase === 'challenged' ? '等待你猜测…' : '发送给挑战者'}
            </Button>

            {/* 密文挑战 */}
            {challenge && (
              <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  挑战者已随机二选一、用新密钥加密。你截获的密文：
                </div>
                <div className="break-all font-mono text-sm text-amber-700 dark:text-amber-300">
                  {challenge.cipherHex}
                  {challenge.lsb !== null && (
                    <span className="ml-2 rounded bg-red-500/15 px-2 py-0.5 text-red-600 dark:text-red-400">
                      ∥ LSB = {challenge.lsb}
                    </span>
                  )}
                </div>
                {phase === 'challenged' && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => makeGuess(0)} className="border-border">
                      我猜是 m₀
                    </Button>
                    <Button variant="outline" onClick={() => makeGuess(1)} className="border-border">
                      我猜是 m₁
                    </Button>
                  </div>
                )}
                {phase === 'revealed' && challenge && guess !== null && (
                  <div
                    className={cn(
                      'rounded-lg border p-3 text-sm',
                      guess === challenge.b
                        ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                        : 'border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300'
                    )}
                  >
                    {guess === challenge.b ? '✓ 猜对了' : '✗ 猜错了'}——挑战者加密的是 m
                    {challenge.b === 0 ? '₀' : '₁'}（"{challenge.b === 0 ? m0 : m1}"）
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 战绩 */}
        <Card className="border-border bg-card/60 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-foreground">
              你的胜率
              <Button size="sm" variant="ghost" onClick={reset} className="text-muted-foreground">
                <RotateCcw className="mr-1 h-3.5 w-3.5" /> 清零
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="font-mono text-4xl font-bold text-foreground">
                {rate === null ? '—' : `${(rate * 100).toFixed(0)}%`}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {rounds} 局 {wins} 胜
              </div>
            </div>
            <div className="relative h-6 overflow-hidden rounded bg-muted">
              {rate !== null && (
                <div
                  className={cn(
                    'h-full transition-all',
                    Math.abs(rate - 0.5) < 0.06 ? 'bg-emerald-500' : rate > 0.5 ? 'bg-red-500' : 'bg-zinc-400'
                  )}
                  style={{ width: `${rate * 100}%` }}
                />
              )}
              <div className="absolute top-0 left-1/2 h-full w-0.5 bg-amber-500" />
            </div>
            <p className="text-center text-xs text-muted-foreground">琥珀线 = 50%（瞎猜水平）</p>

            <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              <p>
                <span className="text-foreground">完美保密 ⟺ 胜率 = 1/2</span>
                ：对一次一密，无论你怎么选明文、用什么策略，密文来自两个明文的概率完全相同，
                局数多了胜率必然回归 50%。
              </p>
              <p>
                <span className="text-foreground">试试缺陷方案</span>
                ：让 m₀、m₁ 的末位比特不同（如 "attack" vs "attac0"），密文末尾直接泄露
                LSB——你将百战百胜。这就是「非完美保密 ⇒ 敌手有优势」的直观含义。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
