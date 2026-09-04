import { useState } from 'react'
import { Eye, Scale, SearchCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Formula, Section } from '../shared'
import { hex2, lrEncrypt, randomPerm8 } from '@/lib/owf'
import { cn } from '@/lib/utils'

interface Oracle {
  kind: 'feistel' | 'random'
  fn: (x: number) => number
}

interface Query {
  x: number
  y: number
}

export default function TcLr() {
  const [rounds, setRounds] = useState<1 | 2 | 3>(2)
  const [oracle, setOracle] = useState<Oracle | null>(null)
  const [queries, setQueries] = useState<Query[]>([])
  const [probeHex, setProbeHex] = useState('35')
  const [guess, setGuess] = useState<'feistel' | 'random' | null>(null)
  const [score, setScore] = useState({ wins: 0, total: 0 })

  const newGame = (r: number) => {
    const kind: Oracle['kind'] = Math.random() < 0.5 ? 'feistel' : 'random'
    const fn =
      kind === 'feistel'
        ? (x: number) => lrEncrypt(x, Math.floor(Math.random() * 0x10000), r)
        : randomPerm8(Math.floor(Math.random() * 0xffffffff))
    setOracle({ kind, fn })
    setQueries([])
    setGuess(null)
  }

  const query = (x: number) => {
    if (!oracle || guess !== null) return
    setQueries((q) => [...q, { x, y: oracle.fn(x) }].slice(-6))
  }

  const probe = parseInt(probeHex, 16)
  const probeValid = !isNaN(probe) && probe <= 0xff

  /** 结构测试：查询 x 与 x⊕0x10（只翻 L₀ 的 1 比特） */
  const structureTest = () => {
    if (!oracle || !probeValid) return
    query(probe)
    query(probe ^ 0x10)
  }

  const makeGuess = (g: 'feistel' | 'random') => {
    if (!oracle || guess !== null) return
    setGuess(g)
    setScore((s) => ({ wins: s.wins + (g === oracle.kind ? 1 : 0), total: s.total + 1 }))
  }

  // 结构性提示：基于已查询数据
  const pair = queries.length >= 2 ? [queries[queries.length - 2], queries[queries.length - 1]] : null
  const hiDiff = pair ? ((pair[0].y ^ pair[1].y) >>> 4) & 0xf : null
  const l0Diff = pair ? ((pair[0].x ^ pair[1].x) >>> 4) & 0xf : null

  return (
    <Section
      id="tc-lr"
      index="05 · PRF ⇒ PRP"
      title="Luby-Rackoff：为什么至少要 3 轮"
      subtitle="Feistel 网络能把 PRF 变成 PRP，但轮数有门槛：3 轮得到 PRP，4 轮得到强 PRP。轮数不够时结构会漏馅——你来做区分器：神谕机要么是 Feistel，要么是真随机排列，用查询找出破绽。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <SearchCheck className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
              区分器游戏（8 比特分组）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <ToggleGroup
                type="single"
                value={String(rounds)}
                onValueChange={(v) => {
                  if (v) {
                    const r = Number(v) as 1 | 2 | 3
                    setRounds(r)
                    setOracle(null)
                    setQueries([])
                    setGuess(null)
                  }
                }}
                className="justify-start"
              >
                <ToggleGroupItem value="1" className="border-border text-xs">1 轮</ToggleGroupItem>
                <ToggleGroupItem value="2" className="border-border text-xs">2 轮</ToggleGroupItem>
                <ToggleGroupItem value="3" className="border-border text-xs">3 轮</ToggleGroupItem>
              </ToggleGroup>
              <Button
                onClick={() => newGame(rounds)}
                className="bg-fuchsia-600 text-white hover:bg-fuchsia-700"
              >
                新游戏（随机选定神谕机）
              </Button>
            </div>

            {oracle && (
              <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
                <div className="flex items-end gap-2">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">查询明文（00–FF）</label>
                    <Input
                      value={probeHex}
                      onChange={(e) => setProbeHex(e.target.value)}
                      className="w-24 border-input bg-background font-mono text-foreground"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="border-border"
                    disabled={!probeValid || guess !== null}
                    onClick={() => query(probe)}
                  >
                    加密它
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border"
                    disabled={!probeValid || guess !== null}
                    onClick={structureTest}
                  >
                    结构测试：x 与 x⊕10
                  </Button>
                </div>

                {queries.length > 0 && (
                  <div className="space-y-1 font-mono text-xs">
                    {queries.map((q, i) => (
                      <div key={i} className="text-muted-foreground">
                        F(0x{hex2(q.x)}) ={' '}
                        <span className="text-foreground">0x{hex2(q.y)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {pair && (
                  <div
                    className={cn(
                      'rounded-lg border p-3 font-mono text-xs',
                      hiDiff === l0Diff
                        ? 'border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300'
                        : 'border-border text-muted-foreground'
                    )}
                  >
                    Δ输入高半 = {l0Diff?.toString(16)} · Δ输出高半 = {hiDiff?.toString(16)}
                    {rounds === 1 && ' · 再看：输出的高半是否等于输入的低半？'}
                    {hiDiff === l0Diff && rounds <= 2 && ' —— 完全相等！这是 Feistel 的马脚'}
                    {hiDiff !== l0Diff && rounds === 3 && '（无规律可循）'}
                  </div>
                )}

                <div className="flex gap-2 border-t border-border pt-3">
                  <Button variant="outline" className="border-border" onClick={() => makeGuess('feistel')} disabled={guess !== null}>
                    我猜：Feistel
                  </Button>
                  <Button variant="outline" className="border-border" onClick={() => makeGuess('random')} disabled={guess !== null}>
                    我猜：真随机排列
                  </Button>
                </div>
                {guess !== null && (
                  <div
                    className={cn(
                      'rounded-lg border p-3 text-sm',
                      guess === oracle.kind
                        ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                        : 'border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300'
                    )}
                  >
                    {guess === oracle.kind ? '✓ 区分成功' : '✗ 被蒙过去了'}——
                    神谕机其实是{oracle.kind === 'feistel' ? `${rounds} 轮 Feistel` : '真随机排列'}
                  </div>
                )}
              </div>
            )}

            <div className="font-mono text-sm text-muted-foreground">
              总战绩 {score.wins}/{score.total}
              {score.total > 0 && ` · 胜率 ${((score.wins / score.total) * 100).toFixed(0)}%`}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">各轮的破绽清单</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="text-foreground">1 轮</span>：L₁ = R₀
                  直接照抄——输出左半就是输入右半，一眼假。
                </li>
                <li>
                  <span className="text-foreground">2 轮</span>：L₂ = L₀ ⊕ f₁(R₀)。
                  固定 R₀、只翻 L₀ 的 1 比特 ⇒
                  <span className="text-foreground">输出高半恰好也只翻那 1 比特</span>
                  （f₁(R₀) 被异或消掉了）。结构测试一招致命。
                </li>
                <li>
                  <span className="text-foreground">3 轮</span>：L₃、R₃
                  都经过了独立 PRF 输出，上面的捷径全部失效——你的胜率会掉回 50%。
                </li>
              </ul>
              <Formula>3 轮 Feistel + PRF ⇒ PRP · 4 轮 ⇒ 强 PRP</Formula>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Scale className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
                强 PRP 多出来的是什么？
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              普通 PRP 只保证「加密方向」不可区分；<span className="text-foreground">强 PRP</span>
              还要求敌手同时能查询<span className="text-foreground">解密方向</span>（逆预言机）也无法区分。
              多出的第 4 轮正是为了堵住反向查询的结构性攻击——回忆第四讲的 CCA，
              双向查询能力正是 CCA 敌手的标配。
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Eye className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
                与第五讲的呼应
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              第五讲的 Feistel 只证明了「是排列」，没证明「伪随机」。Luby-Rackoff
              补上另一半：轮函数是 PRF 时，3 轮输出就与随机排列不可区分。
              DES 的 16 轮，远超理论门槛——为差分/线性分析这类现实攻击留足了余量。
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
