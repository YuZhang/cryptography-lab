import { CircuitBoard, DoorClosed, Link2, TreePine } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const concepts = [
  {
    icon: DoorClosed,
    title: '单向函数 OWF',
    text: '正向易算、逆向难求——姚期智给出的求逆实验把这句话变成了可证明的定义。乘法→分解、模平方→开根、gˣ→离散对数，都是候选。',
  },
  {
    icon: CircuitBoard,
    title: '核心断言 HCP',
    text: '从 f(x) 最难推断的那一比特信息：任何敌手猜中的概率 ≤ 1/2 + 可忽略。Goldreich-Levin 定理：任意 OWF 都能配出一个 HCP。',
  },
  {
    icon: TreePine,
    title: 'GGM 二叉树',
    text: 'PRG 一分为二，二分再二分——n 层树长出 2ⁿ 片叶子，每片叶子是 PRF 在一个输入上的输出。输入比特就是寻路指令：0 向左，1 向右。',
  },
  {
    icon: Link2,
    title: '构造闭环',
    text: 'OWF ⇒ HCP ⇒ PRG ⇒ PRF ⇒ PRP ⇒ 安全私钥加密 ⇒ OWF。单向函数的存在等价于整个私钥密码学的存在——本讲把这条链逐环走完。',
  },
]

export default function TcHero() {
  return (
    <header className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,70,239,0.10),transparent_60%)]" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2 text-fuchsia-600 dark:text-fuchsia-400">
          <TreePine className="h-5 w-5" />
          <span className="text-sm font-medium tracking-widest uppercase">
            Lecture 6 · Theoretical Constructions
          </span>
        </div>
        <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-foreground">
          伪随机对象
          <span className="text-fuchsia-600 dark:text-fuchsia-400">理论构造实验室</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          上一讲用工程直觉搭块密码，这一讲走另一条路：
          <span className="text-foreground">从一个最小假设（单向函数存在）出发，用数学证明逐级建造</span>
          PRG、PRF、PRP，直到安全的私钥加密——而安全加密又反过来蕴涵单向函数。
          你来扮演求逆者、猜测者和区分器，亲手验证链上每一环为什么成立。
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {concepts.map((c) => (
            <Card key={c.title} className="border-border bg-card/60">
              <CardHeader className="pb-2">
                <c.icon className="mb-2 h-6 w-6 text-fuchsia-600 dark:text-fuchsia-400" />
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
