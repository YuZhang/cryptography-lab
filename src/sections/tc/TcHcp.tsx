import { useMemo, useState } from 'react'
import { Binary, Eye, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Formula, Section } from '../shared'
import { bin8, glPredicate, leakyOwf, parity, toyOwp } from '@/lib/owf'
import { cn } from '@/lib/utils'

type Mode = 'gl' | 'leaky'

export default function TcHcp() {
  const [mode, setMode] = useState<Mode>('gl')
  const [x, setX] = useState(0)
  const [r, setR] = useState(0)
  const [fx, setFx] = useState(0)
  const [guess, setGuess] = useState<0 | 1 | null>(null)
  const [rounds, setRounds] = useState(0)
  const [wins, setWins] = useState(0)
  const [started, setStarted] = useState(false)
  const owp = useMemo(() => toyOwp(8, 0xc0de), [])

  const newRound = (m: Mode) => {
    const nx = Math.floor(Math.random() * 256)
    const nr = Math.floor(Math.random() * 256)
    setX(nx)
    setR(nr)
    setFx(m === 'gl' ? owp.f(nx) : leakyOwf(nx, 8))
    setGuess(null)
    setStarted(true)
  }

  const answer: 0 | 1 = mode === 'gl' ? (glPredicate(x, r) as 0 | 1) : (parity(x) as 0 | 1)

  const makeGuess = (g: 0 | 1) => {
    if (guess !== null || !started) return
    setGuess(g)
    setRounds((t) => t + 1)
    if (g === answer) setWins((w) => w + 1)
  }

  const winRate = rounds > 0 ? wins / rounds : null

  return (
    <Section
      id="tc-hcp"
      index="02 · 核心断言"
      title="最难猜的那一比特"
      subtitle="核心断言（HCP）是从 f(x) 中最难推断的关于 x 的一比特：任何敌手的猜中率都超不过 1/2 + 可忽略量。你来扮演敌手——在两种设定下分别猜猜看，体会 Goldreich-Levin 构造为什么需要一段随机串 r。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Binary className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
              HCP 猜测游戏
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(v) => {
                if (v) {
                  const m = v as Mode
                  setMode(m)
                  setRounds(0)
                  setWins(0)
                  newRound(m)
                }
              }}
              className="flex-wrap justify-start"
            >
              <ToggleGroupItem value="gl" className="border-border text-xs">
                GL 构造：gl(x,r) = ⊕ xᵢ·rᵢ
              </ToggleGroupItem>
              <ToggleGroupItem value="leaky" className="border-border text-xs">
                反例：朴素断言 hc(x) = ⊕xᵢ
              </ToggleGroupItem>
            </ToggleGroup>

            {mode === 'gl' ? (
              <Formula>g(x,r) = ( f(x), r ) · gl(x,r) = ⊕ᵢ xᵢ·rᵢ</Formula>
            ) : (
              <Formula>f′(x) 的最低位 = ⊕xᵢ · hc(x) = ⊕xᵢ</Formula>
            )}

            <Button
              onClick={() => newRound(mode)}
              className="bg-fuchsia-600 text-white hover:bg-fuchsia-700"
            >
              新一轮（挑战者随机取 x）
            </Button>

            {started ? (
              <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm">
                <div className="text-muted-foreground">
                  你看到的输出：
                  <span className="ml-1 text-foreground">
                    {bin8(fx)}
                    {mode === 'leaky' && (
                      <span className="ml-1 rounded bg-red-500/20 px-1 text-red-700 dark:text-red-300">
                        ← 最低位就是答案
                      </span>
                    )}
                  </span>
                </div>
                {mode === 'gl' && (
                  <div className="text-muted-foreground">
                    随机串 r = <span className="text-foreground">{bin8(r)}</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {mode === 'gl'
                    ? '任务：不看 x，猜 gl(x, r) = ⊕ xᵢ·rᵢ（r 中 1 选出了 x 的哪些比特参与异或）'
                    : '任务：猜 hc(x) = ⊕xᵢ——这次你能直接读出来吗？'}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-border" onClick={() => makeGuess(0)} disabled={guess !== null}>
                    猜 0
                  </Button>
                  <Button variant="outline" className="border-border" onClick={() => makeGuess(1)} disabled={guess !== null}>
                    猜 1
                  </Button>
                </div>
                {guess !== null && (
                  <div
                    className={cn(
                      'rounded-lg border p-3',
                      guess === answer
                        ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                        : 'border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300'
                    )}
                  >
                    {guess === answer ? '✓ 猜对' : '✗ 猜错'}——答案是 {answer}（x = {bin8(x)}）
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">点击「新一轮」开始</p>
            )}

            <div className="flex items-center gap-3 font-mono text-sm">
              <span className="text-muted-foreground">战绩 {wins}/{rounds}</span>
              {winRate !== null && (
                <span
                  className={cn(
                    mode === 'gl' && winRate < 0.7
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  胜率 {(winRate * 100).toFixed(0)}%
                  {mode === 'gl' && winRate < 0.7 && ' ≈ 1/2 ✓ 与乱猜无异'}
                  {mode === 'gl' && winRate >= 0.7 && '（样本太少，多玩几轮）'}
                  {mode === 'leaky' && winRate > 0.9 && ' ⇒ 断言被完全看穿'}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TriangleAlert className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
                为什么 ⊕xᵢ 不是通用 HCP？
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                直觉上「把输入所有比特异或起来」藏得够深了。但只要 OWF 的
                <span className="text-foreground">输出恰好泄露这个异或值</span>
                （比如最低位就是它），敌手胜率直接 100%——上面反例模式亲眼可见。
              </p>
              <p>
                Goldreich-Levin 的修复：不让断言固定，而是
                <span className="text-foreground">由随机串 r 临场选出 x 的一个随机子集来异或</span>。
                敌手即使从 f(x) 里抠出了 x 的若干比特信息，也推不出任意随机子集的异或值——
                否则就等于恢复了整个 x，与单向性矛盾。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Eye className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
                定义回看
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <Formula>Pr[ A(f(x)) = hc(x) ] ≤ 1/2 + negl(n)</Formula>
              <p>
                一比特信息只有两种取值，乱猜也有 50%。所以 HCP 的标准是
                <span className="text-foreground">「与抛硬币统计上不可区分」</span>——
                这是「最难推断的一比特」的精确含义，也是下一节 Blum-Micali 生成器的弹药。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
