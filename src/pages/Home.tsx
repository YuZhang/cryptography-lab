import { Link } from 'react-router'
import { ArrowRight, BookOpen, Lock, Moon, ShieldCheck, Sparkles, Sun } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

interface Lecture {
  no: string
  title: string
  subtitle: string
  desc: string
  concepts: string[]
  to?: string
  tone: 'amber' | 'emerald' | 'sky' | 'violet' | 'rose' | 'zinc'
  status: 'ready' | 'soon'
}

const lectures: Lecture[] = [
  {
    no: '01',
    title: '古典密码学',
    subtitle: 'Classical Ciphers & Cryptanalysis',
    desc: '凯撒、移位、单表替换、维吉尼亚四种古典加密方案，以及将它们逐一击破的穷举攻击、频率分析、Kasiski 方法与重合指数。附两千年密码攻防史时间线。',
    concepts: ['Kerckhoffs 原则', '充足密钥空间', '重合指数', '任意敌手原则'],
    to: '/classical-ciphers',
    tone: 'amber',
    status: 'ready',
  },
  {
    no: '02',
    title: '完美保密',
    subtitle: 'Perfect Secrecy',
    desc: '信息论意义上的绝对安全：贝叶斯验证、一次一密、二次加密的灾难、|K| ≥ |M| 的代价、香农定理，还有你来当 Eve 的窃听不可区分实验。',
    concepts: ['Pr[M|C]=Pr[M]', '一次一密', '香农定理', '不可区分实验'],
    to: '/perfect-secrecy',
    tone: 'emerald',
    status: 'ready',
  },
  {
    no: '03',
    title: '私钥加密与伪随机（上）',
    subtitle: 'Computational Security & Pseudorandomness',
    desc: '计算安全的两个放松、可忽略函数可视化、PRG 定义与统计测试区分器、种子空间蛮力演示、流密码构造与规约法证明。',
    concepts: ['PPT 敌手', '可忽略函数', 'PRG', '规约法'],
    to: '/computational-security',
    tone: 'sky',
    status: 'ready',
  },
  {
    no: '04',
    title: '私钥加密与伪随机（下）',
    subtitle: 'CPA / CCA Security & Modes of Operation',
    desc: '确定性加密的多重加密死刑、中途岛「淡水计」、PRF 构造 CPA 安全方案、ECB 企鹅像素实验、比特翻转锻造与填充预言机攻击实操。',
    concepts: ['CPA/CCA', 'PRF/PRP', 'ECB/CBC/CTR', '填充预言机'],
    to: '/cpa-cca',
    tone: 'violet',
    status: 'ready',
  },
  {
    no: '05',
    title: '块密码的实践构造',
    subtitle: 'Block Ciphers: SPN, Feistel, DES & AES',
    desc: '亲手搭 16 比特玩具 SPN、观察雪崩效应、步进 Feistel 网络、用中间相遇攻击拆穿双重加密，再亲手计算线性/差分分析表——最后看 DES 四十年从国标沦为 25 秒可破。',
    concepts: ['SPN', 'Feistel 网络', '中间相遇攻击', '差分/线性分析'],
    to: '/block-ciphers',
    tone: 'rose',
    status: 'ready',
  },
]

const toneStyle = {
  amber: 'text-amber-600 dark:text-amber-400 border-amber-500/40',
  emerald: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/40',
  sky: 'text-sky-600 dark:text-sky-400 border-sky-500/40',
  violet: 'text-violet-600 dark:text-violet-400 border-violet-500/40',
  rose: 'text-rose-600 dark:text-rose-400 border-rose-500/40',
  zinc: 'text-muted-foreground border-border',
}

export default function Home() {
  const { dark, toggle } = useTheme()

  return (
    <div
      className={
        (dark ? 'dark bg-zinc-950 ' : 'bg-stone-50 ') +
        'min-h-screen font-sans text-foreground antialiased transition-colors'
      }
    >
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <span className="font-mono text-sm font-semibold text-amber-600 dark:text-amber-400">
            Π = (Gen, Enc, Dec)
          </span>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 border-border"
            onClick={toggle}
            aria-label="切换深浅色主题"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6">
        <header className="relative overflow-hidden py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.08),transparent_60%)]" />
          <div className="relative">
            <div className="mb-4 flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-medium tracking-widest uppercase">
                Interactive Cryptography Lectures
              </span>
            </div>
            <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-foreground">
              密码学导论
              <span className="text-amber-600 dark:text-amber-400">交互讲义</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              每一讲都是一个可以动手玩的实验室：亲自加密、扮演敌手 Eve 发起攻击、拖动滑块看安全性如何瓦解。
              从两千年前的凯撒密码出发，一路走到现代密码学的定义、假设与证明。
            </p>
            <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> 已上线 {lectures.filter((l) => l.status === 'ready').length} 讲
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-amber-500" /> 持续更新中
              </span>
            </div>
          </div>
        </header>

        <div className="grid gap-6 pb-20 md:grid-cols-2">
          {lectures.map((l) => {
            const inner = (
              <Card
                className={cn(
                  'h-full border-border transition-all',
                  l.status === 'ready'
                    ? 'bg-card/60 group-hover:border-amber-500/40 group-hover:shadow-lg'
                    : 'bg-card/30 opacity-60'
                )}
              >
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={cn('font-mono text-2xl font-bold', toneStyle[l.tone].split(' ')[0])}
                    >
                      {l.no}
                    </span>
                    {l.status === 'ready' ? (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        已上线
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-border text-muted-foreground">
                        敬请期待
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                    <Lock className={cn('h-5 w-5', toneStyle[l.tone].split(' ')[0])} />
                    {l.title}
                  </CardTitle>
                  <div className="text-xs tracking-wide text-muted-foreground">{l.subtitle}</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{l.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {l.concepts.map((c) => (
                      <Badge
                        key={c}
                        variant="outline"
                        className={cn('font-mono text-[11px]', toneStyle[l.tone])}
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                  {l.status === 'ready' && (
                    <div
                      className={cn(
                        'flex items-center gap-1 text-sm font-medium',
                        toneStyle[l.tone].split(' ')[0]
                      )}
                    >
                      进入实验室
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
            return l.to ? (
              <Link key={l.no} to={l.to} className="group block">
                {inner}
              </Link>
            ) : (
              <div key={l.no}>{inner}</div>
            )
          })}
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        密码学导论交互讲义 · 基于课程讲义制作 · Kerckhoffs 原则：算法公开，密钥保密
      </footer>
    </div>
  )
}
