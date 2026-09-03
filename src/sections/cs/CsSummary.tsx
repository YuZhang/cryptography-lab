import { Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Section } from '../shared'

const rows: [string, string, string][] = [
  ['敌手', 'PPT 窃听者（算力有限）', '无限算力窃听者'],
  ['定义', '实验成功率 ≤ 1/2 + negl(n)', '实验成功率 = 1/2（恰好）'],
  ['假设', '伪随机性存在（PRG）', '无需假设（真随机）'],
  ['密钥', '短随机串（远短于明文）', '与明文等长的随机串'],
  ['构造', 'c = G(k) ⊕ m', 'c = k ⊕ m'],
  ['证明方法', '规约法', '概率论（贝叶斯）'],
]

export default function CsSummary() {
  return (
    <Section
      id="cs-summary"
      index="04 · 总结"
      title="计算安全 vs 信息论安全"
      subtitle="同一套不可区分实验，两种不同的安全世界。放松一点点要求，换来实用的短密钥——但安全从此建立在假设之上，需要规约证明来担保。"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card/60 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Scale className="h-5 w-5 text-sky-600 dark:text-sky-400" /> 两种安全的对照
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left"></th>
                    <th className="px-4 py-2 text-left text-sky-600 dark:text-sky-400">
                      计算安全（本讲）
                    </th>
                    <th className="px-4 py-2 text-left text-emerald-600 dark:text-emerald-400">
                      信息论安全（上一讲）
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([k, a, b]) => (
                    <tr key={k} className="border-t border-border/60">
                      <td className="px-4 py-2 font-medium text-foreground">{k}</td>
                      <td className="px-4 py-2 text-muted-foreground">{a}</td>
                      <td className="px-4 py-2 text-muted-foreground">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="text-foreground">语义安全</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              「不泄露任何有意义的信息」如何严格定义？语义安全：对任意明文分布、任意函数
              f、h——拿着密文和 h(m) 能算出 f(m) 的敌手，与只拿 h(m)
              的敌手，成功概率之差可忽略。
            </p>
            <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-3 text-foreground">
              定理：窃听不可区分 ⟺ 语义安全
            </div>
            <p className="text-xs">
              直觉：能在不可区分实验中成功 ⟺ 从密文获得了区分明文的信息 ⟺
              获得了关于明文的有意义信息。定义之间的桥梁让「安全」可以互相翻译、按需取用。
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
