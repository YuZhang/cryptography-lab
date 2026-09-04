import { useMemo, useState } from 'react'
import { ArrowRight, Footprints, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Formula, Section } from '../shared'
import { bin8, blumMicali, parity, toyOwp } from '@/lib/owf'
import { cn } from '@/lib/utils'

const MAX_STEPS = 12

export default function TcBm() {
  const [seedHex, setSeedHex] = useState('3C')
  const [steps, setSteps] = useState(4)
  const seed = parseInt(seedHex, 16)
  const valid = !isNaN(seed) && seed <= 0xff

  const owp = useMemo(() => toyOwp(8, 0xb1b1), [])
  const chain = useMemo(
    () => (valid ? blumMicali(seed, steps, owp, parity) : []),
    [seed, steps, owp, valid]
  )
  const outBits = chain.map((s) => s.outBit).join('')

  return (
    <Section
      id="tc-bm"
      index="03 · OWP ⇒ PRG"
      title="Blum-Micali 生成器"
      subtitle="有了单向排列 OWP 和它的核心断言，PRG 的构造出人意料地简单：反复迭代 f，每步挤出 hc 这一比特。f 是排列保证状态均匀游走，hc 不可预测保证下一比特永远像抛硬币——这正是第三讲「下一比特不可预测 ⟺ 伪随机」的用武之地。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Footprints className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
              迭代步进器（8 比特玩具 OWP）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>G(s) = hc(s) · hc(f(s)) · hc(f²(s)) · …</Formula>
            <div className="flex items-end gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">种子 s（00–FF）</label>
                <Input
                  value={seedHex}
                  onChange={(e) => {
                    setSeedHex(e.target.value)
                    setSteps(4)
                  }}
                  className="w-24 border-input bg-background font-mono text-foreground"
                />
              </div>
              <Button
                variant="outline"
                className="border-border"
                disabled={!valid || steps >= MAX_STEPS}
                onClick={() => setSteps((s) => Math.min(MAX_STEPS, s + 4))}
              >
                再走 4 步
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-border"
                onClick={() => setSteps(4)}
                aria-label="重置步数"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            {!valid && <p className="text-xs text-red-600 dark:text-red-400">请输入 00–FF 的十六进制</p>}

            {chain.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
                  {chain.map((s, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="rounded border border-border bg-secondary px-2 py-1 text-secondary-foreground">
                        {bin8(s.state)}
                      </span>
                      {i < chain.length - 1 && (
                        <span className="flex items-center text-muted-foreground">
                          <ArrowRight className="h-3 w-3" />
                          <span className="text-[9px]">f</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      )}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 font-mono text-xs">
                  {chain.map((s, i) => (
                    <span
                      key={i}
                      className="rounded border border-fuchsia-500/40 bg-fuchsia-500/10 px-2 py-1 text-fuchsia-700 dark:text-fuchsia-300"
                      title={`hc(状态${i + 1}) = ⊕ 该状态所有比特`}
                    >
                      hc={s.outBit}
                    </span>
                  ))}
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-sm">
                  <span className="text-muted-foreground">G(s) 输出流：</span>
                  <span className="text-lg tracking-[0.3em] text-fuchsia-700 dark:text-fuchsia-300">
                    {outBits}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    （{chain.length} 比特，1 比特种子挤出 {chain.length} 比特）
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">为什么这是 PRG？两条理由缺一不可</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  <span className="text-foreground">f 必须是排列（OWP）</span>：
                  s 均匀随机 ⇒ f(s) 也均匀随机，状态链均匀游走不塌缩。
                  换成非排列函数，像会越挤越扁，分布偏差立刻露馅。
                </li>
                <li>
                  <span className="text-foreground">hc 必须是核心断言</span>：
                  看到 f(s)（乃至整段历史）也猜不准下一比特 hc(s)——
                  下一比特测试通过 ⟺ 输出伪随机。
                </li>
              </ol>
              <p className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
                定理：f 为 OWP 且 hc 为其 HCP ⇒ G(s)=(f(s), hc(s)) 是扩展因子 n+1 的
                PRG；迭代可得任意多项式 p(n) 的扩展因子。
              </p>
            </CardContent>
          </Card>

          <Card className={cn('border-border bg-card/60')}>
            <CardHeader>
              <CardTitle className="text-foreground">回头看第三讲</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              第三讲我们<span className="text-foreground">假设</span> PRG 存在并构造了流密码；
              现在我们知道 PRG 可以从 OWP <span className="text-foreground">证明出来</span>。
              假设的地基又下沉了一层——下一节继续：PRG 怎么长成 PRF。
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
