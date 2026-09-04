import { ShieldCheck, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Section } from '../shared'

const ladder = [
  { level: 'COA 窃听', power: '只能看密文', tool: 'PRG + 异或（流密码）', note: '确定性方案也可安全' },
  { level: '多重加密', power: '看到同一密钥的多个密文', tool: '需要随机化', note: '确定性加密死刑' },
  { level: 'CPA 选择明文', power: '持续访问加密预言机', tool: 'PRF：⟨r, Fₖ(r)⊕m⟩', note: '⇒ 多重加密安全' },
  { level: 'CCA 选择密文', power: '还能访问解密预言机', tool: '需要不可锻造性', note: '加密+认证（后续课程）' },
]

export default function Cs2Summary() {
  return (
    <Section
      id="cs2-summary"
      index="05 · 总结"
      title="敌手能力阶梯与防御武器"
      subtitle="安全定义一级比一级贴近现实，原语也一级比一级强：PRG → PRF → PRP → 认证加密。每一级都有对应的实验、构造和规约证明。"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card/60 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400" /> 攻击能力阶梯
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left">攻击级别</th>
                    <th className="px-4 py-2 text-left">敌手能力</th>
                    <th className="px-4 py-2 text-left">防御所需</th>
                    <th className="px-4 py-2 text-left">备注</th>
                  </tr>
                </thead>
                <tbody>
                  {ladder.map((l) => (
                    <tr key={l.level} className="border-t border-border/60">
                      <td className="px-4 py-2 font-medium whitespace-nowrap text-foreground">{l.level}</td>
                      <td className="px-4 py-2 text-muted-foreground">{l.power}</td>
                      <td className="px-4 py-2 font-mono text-xs text-violet-700 dark:text-violet-300">
                        {l.tool}
                      </td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{l.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-5 w-5 text-violet-600 dark:text-violet-400" /> 本讲要点
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>CPA 安全必须随机化：随机 r（随机化）、计数器（有状态）、Nonce（只用一次）三条路线。</li>
              <li>IV/ctr 必须随机且不可预测——WEP 与 TLS 1.0 都是反面教材。</li>
              <li>ECB 永不使用；CTR/CBC 在随机 IV 下 CPA 安全。</li>
              <li>CPA 安全不防篡改：可锻造 ⇒ CCA 攻击（填充预言机）。</li>
              <li>CCA 安全 = 不可区分 + 不可锻造，需要消息认证——下一部分的主题。</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
