import { Equal, KeyRound, Scale, Swords } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Formula, Section } from '../shared'

const definitions = [
  {
    icon: Scale,
    title: '完美保密 Perfect Secrecy',
    formula: 'Pr[M=m | C=c] = Pr[M=m]',
    text: '知道密文对猜测明文没有帮助——后验等于先验。',
  },
  {
    icon: Equal,
    title: '完美不可区分 Perfect Indistinguishability',
    formula: 'Pr[C=c | M=m₀] = Pr[C=c | M=m₁]',
    text: '任意两个明文加密成同一密文的概率相同——给定明文对推测密文没有帮助，密文无法被指认来自谁。',
  },
  {
    icon: Swords,
    title: '敌手不可区分 Adversarial Indistinguishability',
    formula: 'Pr[敌手在实验中成功] = 1/2',
    text: '窃听不可区分实验中，任意敌手的胜率等于瞎猜。这个"实验式"定义会在后续课程中反复出现。',
  },
]

export default function PsSummary() {
  return (
    <Section
      id="ps-summary"
      index="05 · 总结"
      title="三个定义，一个本质"
      subtitle="看似不同的定义存在相同的本质——对同一个概念从不同角度定义，对理解和应用它至关重要。"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {definitions.map((d) => (
          <Card key={d.title} className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <d.icon className="mb-2 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-sm text-foreground">{d.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Formula>{d.formula}</Formula>
              <p className="text-xs leading-relaxed text-muted-foreground">{d.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm leading-relaxed text-muted-foreground">
        <KeyRound className="mr-1 inline h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-foreground">本讲要点</span>
        ：完美保密是可以获得的（一次一密）；代价是 |K| ≥ |M| 且密钥只用一次；
        香农定理把定义变成可检验的两条——密钥均匀 + 任意 (m, c) 间存在唯一密钥。
        下一讲将看到：放宽「完美」、只要求「计算上不可区分」，实用的现代加密才真正开始。
      </div>
    </Section>
  )
}
