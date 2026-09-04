import { Boxes, GitBranch, ShieldAlert, Swords } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const concepts = [
  {
    icon: Boxes,
    title: '混淆与扩散',
    text: '香农的设计范式：混淆让密钥与密文的关系复杂难懂，扩散把明文的统计冗余摊薄到整个密文。SPN 用 S 盒做混淆、P 盒做扩散。',
  },
  {
    icon: GitBranch,
    title: 'Feistel 网络',
    text: '从不可逆的零件造出可逆的整体——轮函数随便设计，网络天然是排列。DES 的骨架。',
  },
  {
    icon: Swords,
    title: '中间相遇攻击',
    text: '双重加密密钥翻倍，安全性却不翻倍：空间换时间，O(2ⁿ) 破解 2n 比特密钥。DESX 白化与三重 DES 应运而生。',
  },
  {
    icon: ShieldAlert,
    title: '差分 / 线性分析',
    text: '不买断算法也能拆穿它：统计 S 盒输入输出间的偏差，逐轮穿透，最后只猜一小撮子密钥比特。',
  },
]

export default function BcHero() {
  return (
    <header className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.10),transparent_60%)]" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <Boxes className="h-5 w-5" />
          <span className="text-sm font-medium tracking-widest uppercase">
            Lecture 5 · Block Ciphers in Practice
          </span>
        </div>
        <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-foreground">
          块密码
          <span className="text-rose-600 dark:text-rose-400">构造与分析实验室</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          理论上我们已经有 PRP 这个理想原语，但真的造一个出来是另一回事——它是
          <span className="text-foreground">启发式工程</span>
          ，没有证明，只有久经攻击而不倒的信心。本讲亲手搭一台 16 比特玩具
          SPN，观察雪崩效应，步进 Feistel 网络，用中间相遇攻击拆穿双重加密，
          再亲手算出线性/差分分析的核心表格，看 DES 如何在 40 年里从国家标准沦为
          <span className="text-foreground"> 25 秒可破</span>。
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {concepts.map((c) => (
            <Card key={c.title} className="border-border bg-card/60">
              <CardHeader className="pb-2">
                <c.icon className="mb-2 h-6 w-6 text-rose-600 dark:text-rose-400" />
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
