import { useMemo, useState } from 'react'
import { Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Formula, Section } from '../shared'
import { cn } from '@/lib/utils'

function pct(x: number): string {
  return (x * 100).toFixed(1) + '%'
}

/** 一条概率条：标签 + 数值 + 条形 */
function ProbBar({
  label,
  value,
  reference,
  tone,
}: {
  label: string
  value: number | null
  reference: number
  tone: 'good' | 'bad' | 'neutral'
}) {
  const color =
    tone === 'good'
      ? 'bg-emerald-500'
      : tone === 'bad'
        ? 'bg-red-500'
        : 'bg-zinc-400 dark:bg-zinc-500'
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={cn(
            tone === 'good' && 'text-emerald-600 dark:text-emerald-400',
            tone === 'bad' && 'text-red-600 dark:text-red-400',
            tone === 'neutral' && 'text-foreground'
          )}
        >
          {value === null ? '—' : pct(value)}
        </span>
      </div>
      <div className="relative h-5 overflow-hidden rounded bg-muted">
        {value !== null && (
          <div className={cn('h-full transition-all', color)} style={{ width: `${value * 100}%` }} />
        )}
        {/* 先验概率参考线 */}
        <div
          className="absolute top-0 h-full w-0.5 bg-amber-500"
          style={{ left: `${reference * 100}%` }}
          title={`先验 ${pct(reference)}`}
        />
      </div>
    </div>
  )
}

export default function PsDefinition() {
  const [p, setP] = useState(0.7) // Pr[M=1]
  const [q, setQ] = useState(0.5) // Pr[K=1]：密钥偏差

  // 一比特方案 Enc_k(m) = m ⊕ k 的贝叶斯后验
  const { post0, post1 } = useMemo(() => {
    // Pr[M=1|C=0] = q·p / (q·p + (1-q)(1-p))
    const d0 = q * p + (1 - q) * (1 - p)
    // Pr[M=1|C=1] = (1-q)·p / ((1-q)p + q(1-p))
    const d1 = (1 - q) * p + q * (1 - p)
    return {
      post0: d0 > 0 ? (q * p) / d0 : null,
      post1: d1 > 0 ? ((1 - q) * p) / d1 : null,
    }
  }, [p, q])

  const perfect = Math.abs(q - 0.5) < 1e-9

  return (
    <Section
      id="ps-definition"
      index="01 · 定义"
      title="完美保密的定义与贝叶斯验证"
      subtitle="直觉：敌手知道明文的先验分布、知道加密方案，唯一的新信息只有密文。若看完密文后的后验判断与先验完全相同，密文就没有泄露任何东西。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="text-foreground">定义与一比特证明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              对 M 上的<span className="text-foreground">任意</span>概率分布，∀m ∈ M，∀c ∈ C 且
              Pr[C=c] &gt; 0：
            </p>
            <Formula>Pr[M=m | C=c] = Pr[M=m]</Formula>
            <p>
              考察最简单的方案：M = K = {'{'}0,1{'}'}，Encₖ(m) = m ⊕ k，密钥均匀随机
              （Pr[K=1] = 1/2）。设 Pr[M=1] = p，由贝叶斯定理：
            </p>
            <Formula>
              Pr[M=1|C=0] = ½·p / (½·p + ½·(1−p)) = p
            </Formula>
            <p>
              后验 = 先验，所以它是<span className="text-emerald-600 dark:text-emerald-400">完美保密</span>的。
              关键洞察：<span className="text-foreground">只要密钥均匀随机</span>，密文分布就不受明文分布影响
              ——密文不携带明文的统计模式。
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              动手验证：密钥必须均匀吗？
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>明文分布 Pr[M=1] = p</span>
                <span className="font-mono text-foreground">{pct(p)}</span>
              </div>
              <Slider value={[p * 100]} onValueChange={([v]) => setP(v / 100)} min={1} max={99} step={1} />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>密钥分布 Pr[K=1] = q（拖动让它偏离 50%）</span>
                <span className="font-mono text-foreground">{pct(q)}</span>
              </div>
              <Slider value={[q * 100]} onValueChange={([v]) => setQ(v / 100)} min={1} max={99} step={1} />
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
              <ProbBar label="先验 Pr[M=1]" value={p} reference={p} tone="neutral" />
              <ProbBar
                label="后验 Pr[M=1 | C=0]"
                value={post0}
                reference={p}
                tone={perfect ? 'good' : 'bad'}
              />
              <ProbBar
                label="后验 Pr[M=1 | C=1]"
                value={post1}
                reference={p}
                tone={perfect ? 'good' : 'bad'}
              />
              <p className="text-xs text-muted-foreground">琥珀色竖线 = 先验概率位置</p>
            </div>

            {perfect ? (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                ✓ 密钥均匀（q = 50%）：无论 p 怎么变，后验永远等于先验——完美保密成立。
              </p>
            ) : (
              <p className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-700 dark:text-red-300">
                ✗ 密钥有偏差（q = {pct(q)}）：密文开始"告密"！看到 C=0 后敌手对明文的判断偏移了
                {post0 !== null && ` ${pct(Math.abs(post0 - p))}`}——完美保密瓦解。
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
