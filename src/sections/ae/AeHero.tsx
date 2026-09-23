import { Combine, Disc3, KeyRound, ShieldHalf } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const concepts = [
  {
    icon: ShieldHalf,
    title: 'CCA 安全 = 不可区分 + 不可锻造',
    text: '敌手能同时查加密和解密预言机。第四讲见过填充预言机——本讲要系统性地让解密预言机「失业」：验不过标签的密文直接 ⊥。',
  },
  {
    icon: Combine,
    title: '三种组合，一种正确',
    text: '加密并认证（SSH）会漏消息；先认证后加密（SSL）被一比特翻转预言机拆穿；先加密后认证（IPsec）才是可证明安全的通用范式。',
  },
  {
    icon: Disc3,
    title: '确定性加密与磁盘',
    text: '加密数据库索引、磁盘扇区都要求同明文同密文。SIV 合成初始向量、宽块 PRP、XTS 可调加密——三路线各有所长。',
  },
  {
    icon: KeyRound,
    title: '密钥派生 KDF',
    text: '一个秘密长出许多密钥：均匀密钥用 PRF 计数器模式；非均匀密钥先 HKDF 提取再扩展；口令要加盐并迭代拉伸。',
  },
]

export default function AeHero() {
  return (
    <header className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,88,12,0.10),transparent_60%)]" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2 text-orange-600 dark:text-orange-400">
          <ShieldHalf className="h-5 w-5" />
          <span className="text-sm font-medium tracking-widest uppercase">
            Lecture 8 · CCA Security & Authenticated Encryption
          </span>
        </div>
        <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-foreground">
          认证加密
          <span className="text-orange-600 dark:text-orange-400">组装实验室</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          至此我们手上各有一块好砖：CPA 安全加密（机密性）和安全 MAC（真实性）。
          本讲的中心问题是<span className="text-foreground">怎么把两块砖砌在一起</span>——
          顺序错了会被一比特信息泄露击穿，实现粗心了会被非原子解密出卖。
          然后走向真实系统的约束：确定性加密、磁盘加密与密钥派生。
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {concepts.map((c) => (
            <Card key={c.title} className="border-border bg-card/60">
              <CardHeader className="pb-2">
                <c.icon className="mb-2 h-6 w-6 text-orange-600 dark:text-orange-400" />
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
