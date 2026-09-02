import { KeyRound, ShieldAlert, Users, BookOpenCheck, GitBranch, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Section } from './shared'

const evolution = [
  { from: '凯撒密码', to: '移位密码', fix: '无密钥 → 引入密钥 k' },
  { from: '移位密码', to: '单表替换', fix: '密钥空间太小 → 任意排列，2⁸⁸ 个密钥' },
  { from: '单表替换', to: '维吉尼亚', fix: '字母频率不变 → 引入位置因素抹平分布' },
  { from: '维吉尼亚', to: '现代密码', fix: '周期间隔频率仍泄露 → 定义、假设、证明' },
]

const lessons = [
  {
    icon: KeyRound,
    title: '充足密钥空间原则',
    text: '任何安全加密方案必须具有一个经受得住穷举搜索的密钥空间。移位密码只有 26 个密钥，瞬间告破。',
  },
  {
    icon: ShieldAlert,
    title: '复杂性不意味着安全',
    text: '单表替换有 2⁸⁸ 个密钥，维吉尼亚曾两百多年无解——但都倒在统计分析下。设计加密方案是一项艰巨的任务。',
  },
  {
    icon: Users,
    title: '任意敌手原则',
    text: '对于一类具有指定能力的敌手中的任意一个，安全都必须被确保。安全与否只考虑敌手能力，不受敌手具体策略左右。',
  },
  {
    icon: BookOpenCheck,
    title: '原则一：精确定义',
    text: '对安全和威胁模型给出严格的形式化定义——「没有敌手能从密文中获得关于明文的任何有意义的信息」。',
  },
  {
    icon: GitBranch,
    title: '原则二：精确假设',
    text: '当安全依赖于无法证明的假设时，假设必须被精确描述并且尽可能小。简单、低级的假设更容易被研究、拒绝和修正。',
  },
  {
    icon: Award,
    title: '原则三：严格证明',
    text: '用规约法证明安全性：若假设 X 成立（问题难），则破解方案 Y 比解决 X 更难，故破解不可能。',
  },
]

export default function PrinciplesSection() {
  return (
    <Section
      id="principles"
      index="05 · 总结"
      title="从古典密码学到现代密码学"
      subtitle="「打补丁式」的路线——提出方案、被破解、再打补丁——难以保证安全。现代密码学用三原则取而代之。"
    >
      {/* 演进链 */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {evolution.map((e, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="rounded-lg border border-border bg-card px-3 py-2 text-center">
              <div className="font-mono text-sm text-foreground">{e.from}</div>
              <div className="mt-0.5 max-w-40 text-[10px] leading-tight text-muted-foreground">
                {e.fix}
              </div>
            </div>
            {i < evolution.length - 1 && (
              <span className="text-amber-600 dark:text-amber-400">→</span>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((l) => (
          <Card key={l.title} className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <l.icon className="mb-2 h-6 w-6 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-sm text-foreground">{l.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">{l.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  )
}
