import { useState } from 'react'
import { Copy, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { bytesToHex, textToBytes } from '@/lib/otp'
import { Formula, Section } from '../shared'
import { cn } from '@/lib/utils'

// 玩具确定性加密：每个字节加固定密钥（模 256）——确定性 ⇒ 同明文同密文
const FIXED_KEY = 0x5a
const detEnc = (m: number[]) => m.map((b) => (b + FIXED_KEY) & 0xff)

type Phase = 'idle' | 'challenged' | 'revealed'

export default function Cs2Mult() {
  const [ma, setMa] = useState('attack')
  const [mb, setMb] = useState('wait!!')
  const [phase, setPhase] = useState<Phase>('idle')
  const [b, setB] = useState<0 | 1>(0)
  const [pair, setPair] = useState<[string, string] | null>(null)
  const [guess, setGuess] = useState<0 | 1 | null>(null)
  const [rounds, setRounds] = useState(0)
  const [wins, setWins] = useState(0)

  const valid = ma.length > 0 && ma.length === mb.length

  function start() {
    if (!valid) return
    const bb = (Math.random() < 0.5 ? 0 : 1) as 0 | 1
    // M₀ = (ma, ma)，M₁ = (ma, mb)；挑战者用同一密钥逐条加密
    const vec = bb === 0 ? [ma, ma] : [ma, mb]
    setPair([bytesToHex(detEnc(textToBytes(vec[0]))), bytesToHex(detEnc(textToBytes(vec[1])))])
    setB(bb)
    setGuess(null)
    setPhase('challenged')
  }

  function makeGuess(g: 0 | 1) {
    if (phase !== 'challenged') return
    setGuess(g)
    setRounds((r) => r + 1)
    if (g === b) setWins((w) => w + 1)
    setPhase('revealed')
  }

  return (
    <Section
      id="cs2-mult"
      index="01 · 多重加密"
      title="多重加密与确定性加密的死刑"
      subtitle="一个密钥加密多条消息是现实刚需。但确定性加密（同明文必得同密文）在多重加密实验面前一击即溃——你来扮演敌手，百发百中。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Copy className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              游戏：确定性加密必败
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>M⃗₀ = (m, m) · M⃗₁ = (m, m′) · c¹ == c² ⇒ b′ = 0</Formula>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">m（两条向量都有）</label>
                <Input
                  value={ma}
                  onChange={(e) => setMa(e.target.value)}
                  className="border-input bg-background font-mono text-foreground"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">m′（等长）</label>
                <Input
                  value={mb}
                  onChange={(e) => setMb(e.target.value)}
                  className="border-input bg-background font-mono text-foreground"
                />
              </div>
            </div>
            {!valid && (
              <p className="text-xs text-red-600 dark:text-red-400">两个明文必须等长</p>
            )}
            <Button
              onClick={start}
              disabled={!valid || phase === 'challenged'}
              className="bg-violet-600 text-white hover:bg-violet-700"
            >
              交给挑战者（同一密钥加密两条）
            </Button>

            {pair && (
              <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="font-mono text-xs space-y-1">
                  <div className="text-muted-foreground">c¹ = <span className="text-amber-700 dark:text-amber-300">{pair[0]}</span></div>
                  <div className="text-muted-foreground">c² = <span className="text-amber-700 dark:text-amber-300">{pair[1]}</span></div>
                  <div className={cn('pt-1', pair[0] === pair[1] ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground')}>
                    {pair[0] === pair[1] ? '⚠ c¹ == c² —— 两条明文相同！' : 'c¹ ≠ c²'}
                  </div>
                </div>
                {phase === 'challenged' && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => makeGuess(0)} className="border-border">是 M⃗₀</Button>
                    <Button variant="outline" onClick={() => makeGuess(1)} className="border-border">是 M⃗₁</Button>
                  </div>
                )}
                {phase === 'revealed' && guess !== null && (
                  <div className={cn(
                    'rounded-lg border p-3 text-sm',
                    guess === b
                      ? 'border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300'
                      : 'border-border text-muted-foreground'
                  )}>
                    {guess === b ? '✓ 又猜对了（这不意外）' : '✗ 猜错了'}——挑战者选的是 M⃗{b}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 font-mono text-sm">
              <span className="text-muted-foreground">战绩 {wins}/{rounds}</span>
              <span className="text-muted-foreground">胜率</span>
              <span className={cn(rounds > 0 && wins === rounds ? 'text-red-600 dark:text-red-400' : 'text-foreground')}>
                {rounds === 0 ? '—' : `${((wins / rounds) * 100).toFixed(0)}%`}
              </span>
              {rounds > 0 && wins === rounds && (
                <span className="text-xs text-red-600 dark:text-red-400">⇒ 确定性加密不是多重加密安全的</span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">流密码的两种多消息模式</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                <span className="text-foreground">同步模式</span>：密钥流的不同段落分别加密各条消息——双方要保持同步，适合持续通信（语音）。
              </p>
              <p>
                <span className="text-foreground">异步模式</span>：每次随机选初始向量 IV（公开但随机），
                流 = G(IV‖k)——适合间断通信（即时消息）。
                <span className="text-foreground">IV 公开、密钥保密；IV 不可复用、不可预测。</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-500/30 bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Wifi className="h-5 w-5" /> 真实事故：WEP 的 IV 灾难
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>802.11 WEP：Enc(mᵢ) = ⟨IVᵢ, G(IVᵢ‖k) ⊕ mᵢ⟩，IV 只有 24 比特：</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>约 1600 万帧后 IV 必然重复（生日悖论下更早）；</li>
                <li>一些网卡重启后 IV 归零——昨天的密钥流今天原样复用；</li>
                <li>IVᵢ = IVᵢ₋₁ + 1 递增——对 RC4，约 40,000 帧即可恢复密钥 k。</li>
              </ul>
              <p className="text-red-700 dark:text-red-300">
                结论：相关/重复的 (IV, k) 对让上一讲的一切安全保证作废。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
