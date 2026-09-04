import { Layers, Radio, Target, Wand2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const concepts = [
  {
    icon: Layers,
    title: '攻击能力阶梯',
    text: '窃听（COA）→ 多重加密 → 选择明文（CPA）→ 选择密文（CCA）。敌手一级比一级强，定义也一级比一级贴近现实世界。',
  },
  {
    icon: Target,
    title: '预言机 Oracle',
    text: '黑盒比喻：敌手把任意明文（或密文）交给它，拿回对应密文（或明文），却看不到内部构造。密钥始终保密。',
  },
  {
    icon: Wand2,
    title: '新原语：PRF / PRP',
    text: 'PRG 从种子生成一个随机串；PRF 从密钥生成一个随机函数；PRP 还是双射。CPA 安全的加密由 PRF 构造。',
  },
  {
    icon: Radio,
    title: '真实世界案例密集',
    text: '中途岛海战的"AF"淡水计、WEP 的 IV 灾难、SSL/TLS 1.0 的可预测 IV、CAPTCHA 服务的填充预言机——本讲全程有故事。',
  },
]

export default function Cs2Hero() {
  return (
    <header className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.10),transparent_60%)]" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2 text-violet-600 dark:text-violet-400">
          <Layers className="h-5 w-5" />
          <span className="text-sm font-medium tracking-widest uppercase">
            Lecture 4 · CPA & CCA Security
          </span>
        </div>
        <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-foreground">
          CPA / CCA 安全
          <span className="text-violet-600 dark:text-violet-400">交互实验室</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          上一讲的窃听者只能被动观察。现实中的敌手要主动得多：他们能诱导对方加密指定内容
          <span className="text-foreground">（CPA）</span>，甚至能篡改密文观察解密结果
          <span className="text-foreground">（CCA）</span>。
          本讲用伪随机函数构造真正实用的加密方案，并亲眼见证 ECB
          企鹅与填充预言机攻击这两个密码学名场面。
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {concepts.map((c) => (
            <Card key={c.title} className="border-border bg-card/60">
              <CardHeader className="pb-2">
                <c.icon className="mb-2 h-6 w-6 text-violet-600 dark:text-violet-400" />
                <CardTitle className="text-sm text-foreground">{c.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs leading-relaxed text-muted-foreground">{c.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </header>
  )
}
