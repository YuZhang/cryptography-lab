import { Link } from 'react-router'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { NavAnchor } from '@/sections/shared'
import BcHero from '@/sections/bc/BcHero'
import BcSpn from '@/sections/bc/BcSpn'
import BcAvalanche from '@/sections/bc/BcAvalanche'
import BcFeistel from '@/sections/bc/BcFeistel'
import BcMitm from '@/sections/bc/BcMitm'
import BcAnalysis from '@/sections/bc/BcAnalysis'
import BcSummary from '@/sections/bc/BcSummary'

const nav = [
  { href: '#bc-spn', label: 'SPN' },
  { href: '#bc-avalanche', label: '雪崩效应' },
  { href: '#bc-feistel', label: 'Feistel' },
  { href: '#bc-mitm', label: '中间相遇' },
  { href: '#bc-analysis', label: '线性/差分' },
  { href: '#bc-summary', label: '编年史' },
]

export default function BlockCiphers() {
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
          <Link
            to="/"
            className="flex items-center gap-1 font-mono text-sm font-semibold text-rose-600 transition-colors hover:text-rose-500 dark:text-rose-400"
          >
            <ArrowLeft className="h-4 w-4" /> 课程目录
          </Link>
          <div className="flex items-center gap-5">
            <div className="hidden gap-5 text-sm text-muted-foreground md:flex">
              {nav.map((n) => (
                <NavAnchor
                  key={n.href}
                  id={n.href.slice(1)}
                  label={n.label}
                  className="transition-colors hover:text-rose-600 dark:hover:text-rose-300"
                />
              ))}
            </div>
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
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6">
        <BcHero />
        <BcSpn />
        <BcAvalanche />
        <BcFeistel />
        <BcMitm />
        <BcAnalysis />
        <BcSummary />
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        块密码构造与分析交互实验室 · 基于《密码学导论》课程讲义第四讲 · 启发式构造的信心 =
        抗住所有已知攻击
      </footer>
    </div>
  )
}
