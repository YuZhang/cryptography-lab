import { Dice5, Scale, Infinity as InfinityIcon, Swords } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const concepts = [
  {
    icon: Scale,
    title: '完美保密 Perfect Secrecy',
    text: 'Pr[M=m | C=c] = Pr[M=m]：看到密文之后，你对明文的判断和没看到时一模一样。密文对猜测明文没有任何帮助。',
  },
  {
    icon: Dice5,
    title: '无需前提假设',
    text: '古典密码的安全靠"敌手算不动"，完美保密是信息论意义上的安全——不依赖任何计算假设， unconditional（无条件）成立。',
  },
  {
    icon: InfinityIcon,
    title: '三个等价定义',
    text: '完美保密 = 完美不可区分 = 敌手不可区分。看似不同的定义有着相同的本质——多角度定义同一概念，是理解与应用它的关键。',
  },
  {
    icon: Swords,
    title: '完美中的不完美',
    text: '一次一密确实完美，但密钥必须和明文一样长、且只能用一次。香农定理告诉你：这不是巧合，而是完美保密的代价。',
  },
]

export default function PsHero() {
  return (
    <header className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.10),transparent_60%)]" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Scale className="h-5 w-5" />
          <span className="text-sm font-medium tracking-widest uppercase">
            Lecture 2 · Perfect Secrecy
          </span>
        </div>
        <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-foreground">
          完美保密
          <span className="text-emerald-600 dark:text-emerald-400">交互实验室</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          上一讲的古典密码全部被统计分析击穿。这一讲我们登上信息论的高地：是否存在
          <span className="text-foreground">无论敌手多聪明、算力多强都绝对无法攻破</span>
          的加密？答案是肯定的——一次一密。但你将亲手玩到它的代价，以及密码学中最重要的思想实验：
          <span className="text-foreground">窃听不可区分实验</span>。
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {concepts.map((c) => (
            <Card key={c.title} className="border-border bg-card/60">
              <CardHeader className="pb-2">
                <c.icon className="mb-2 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
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
