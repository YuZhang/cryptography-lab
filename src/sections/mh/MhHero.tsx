import { Fingerprint, ShieldCheck, Stamp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const concepts = [
  {
    icon: ShieldCheck,
    title: '完整性 ≠ 机密性',
    text: '加密防偷看，不防篡改——第四讲的比特翻转已经证明。MAC 回答的是另一个问题：这条消息真的是 Alice 发的吗？中途有没有被动过？',
  },
  {
    icon: Stamp,
    title: '存在性不可伪造',
    text: '最强的安全目标挡住最弱的伪造：哪怕只伪造出一条从未发送过的新消息的有效标签，MAC 就输了。重放攻击靠序列号/时间戳，不归密码学管。',
  },
  {
    icon: Fingerprint,
    title: '抗碰撞哈希 CRHF',
    text: '把任意长消息压成短指纹，且找不到两个不同的输入得到同一指纹。生日悖论警告：输出长度决定蛮力上限 2^(ℓ/2)。',
  },
  {
    icon: Users,
    title: '从 PRF 到 HMAC 到 SUF',
    text: '三条构造路线：PRF 直接当 MAC；哈希双重包裹成 HMAC（工业标准 RFC2104）；代数直线 h=a·m+b 给出信息论安全——代价是密钥按查询次数线性膨胀。',
  },
]

export default function MhHero() {
  return (
    <header className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(13,148,136,0.10),transparent_60%)]" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2 text-teal-600 dark:text-teal-400">
          <Fingerprint className="h-5 w-5" />
          <span className="text-sm font-medium tracking-widest uppercase">
            Lecture 7 · MAC & Hash Functions
          </span>
        </div>
        <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-foreground">
          消息认证与哈希
          <span className="text-teal-600 dark:text-teal-400">攻防实验室</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          上一讲闭合了私钥加密的理论地基，但机密性只是故事的一半——
          <span className="text-foreground">敌手不解密也能搞破坏：改数据、冒充发送者</span>。
          本讲亲手伪造 WEP 的 CRC32 标签、用追加攻击拆穿裸 CBC-MAC、
          对前缀密钥 MAC 发起长度扩展，再用生日悖论算出哈希输出到底该多长，
          最后看一眼不要任何计算假设的信息论 MAC。
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {concepts.map((c) => (
            <Card key={c.title} className="border-border bg-card/60">
              <CardHeader className="pb-2">
                <c.icon className="mb-2 h-6 w-6 text-teal-600 dark:text-teal-400" />
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
