import { Shield, KeyRound, Lock, Eye, Swords } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const concepts = [
  {
    icon: Lock,
    title: '加密方案 Π = (Gen, Enc, Dec)',
    text: '密钥生成、加密、解密三个算法构成一个加密方案。基本正确性要求：Dec_k(Enc_k(m)) = m。',
  },
  {
    icon: KeyRound,
    title: 'Kerckhoffs 原则',
    text: '「加密方法一定不必是秘密，即便落入敌手也必无不妥。」香农箴言：敌人了解系统。保密的是密钥，不是算法。',
  },
  {
    icon: Eye,
    title: '攻击场景',
    text: '唯密文攻击 (COA)、已知明文攻击 (KPA)、选择明文攻击 (CPA)、选择密文攻击 (CCA)。古典密码在 COA 下即被逐一攻破。',
  },
  {
    icon: Swords,
    title: 'Alice、Bob 与 Eve',
    text: 'Alice 向 Bob 发送加密消息，窃听者 Eve 截获密文并尝试恢复明文。下面的每个实验室，你都可以扮演 Eve。',
  },
]

export default function Hero() {
  return (
    <header className="relative overflow-hidden py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.10),transparent_60%)]" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Shield className="h-5 w-5" />
          <span className="text-sm font-medium tracking-widest uppercase">
            Classical Cryptography Lab
          </span>
        </div>
        <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-foreground">
          古典密码学
          <span className="text-amber-600 dark:text-amber-400">交互实验室</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          加密并没有想象的复杂，但设计安全的加密非常困难。 在这里动手体验四种古典加密方案——
          <span className="text-foreground">凯撒密码、移位密码、单表替换、维吉尼亚密码</span>
          ——以及将它们逐一击破的密码分析方法：穷举攻击、字母频率分析、Kasiski
          方法与重合指数。
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {concepts.map((c) => (
            <Card key={c.title} className="border-border bg-card/60">
              <CardHeader className="pb-2">
                <c.icon className="mb-2 h-6 w-6 text-amber-600 dark:text-amber-400" />
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
