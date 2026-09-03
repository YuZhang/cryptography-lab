import { Hourglass, TrendingDown, Cpu, Route } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const concepts = [
  {
    icon: Hourglass,
    title: '放松一：可行的时间',
    text: '敌手只有有限算力。只要给足时间遍历密钥空间，蛮力攻击必然成功——所以只要求「多项式时间内攻不破」。',
  },
  {
    icon: TrendingDown,
    title: '放松二：可忽略的概率',
    text: '瞎猜也有 1/|K| 的概率成功，堵不住。所以允许敌手以「比任何多项式倒数都小」的可忽略概率成功。',
  },
  {
    icon: Cpu,
    title: 'P ≠ NP 的信念',
    text: '1955 年纳什致信 NSA：他猜测破译密码需要密钥长度指数级的时间——这隐含着 P ≠ NP。计算安全的大厦建立在这个信念之上。',
  },
  {
    icon: Route,
    title: '现代密码学研究范式',
    text: '本讲走一遍完整流程：定义（不可区分实验）→ 假设（PRG 存在）→ 构造（流密码）→ 规约法证明安全。',
  },
]

export default function CsHero() {
  return (
    <header className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.10),transparent_60%)]" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2 text-sky-600 dark:text-sky-400">
          <Cpu className="h-5 w-5" />
          <span className="text-sm font-medium tracking-widest uppercase">
            Lecture 3 · Computational Security & Pseudorandomness
          </span>
        </div>
        <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-foreground">
          计算安全与伪随机
          <span className="text-sky-600 dark:text-sky-400">交互实验室</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          完美保密要求密钥和明文一样长——实践中做不到。这一讲我们做出两个「妥协」：
          只防<span className="text-foreground">算力有限</span>的敌手、允许
          <span className="text-foreground">可忽略</span>的破解概率。
          作为回报，我们将用<span className="text-foreground">短短一把密钥</span>安全地加密任意长的消息——
          现代密码学由此真正开始。
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {concepts.map((c) => (
            <Card key={c.title} className="border-border bg-card/60">
              <CardHeader className="pb-2">
                <c.icon className="mb-2 h-6 w-6 text-sky-600 dark:text-sky-400" />
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
