import { Link } from 'react-router'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { NavAnchor } from '@/sections/shared'
import PsHero from '@/sections/ps/PsHero'
import PsDefinition from '@/sections/ps/PsDefinition'
import PsOtp from '@/sections/ps/PsOtp'
import PsLimit from '@/sections/ps/PsLimit'
import PsGame from '@/sections/ps/PsGame'
import PsSummary from '@/sections/ps/PsSummary'

const nav = [
  { href: '#ps-definition', label: '定义' },
  { href: '#ps-otp', label: '一次一密' },
  { href: '#ps-limit', label: '局限与香农定理' },
  { href: '#ps-game', label: '不可区分实验' },
  { href: '#ps-summary', label: '总结' },
]

export default function PerfectSecrecy() {
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
            className="flex items-center gap-1 font-mono text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400"
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
                  className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-300"
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
        <PsHero />
        <PsDefinition />
        <PsOtp />
        <PsLimit />
        <PsGame />
        <PsSummary />
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        完美保密交互实验室 · 基于《密码学导论》课程讲义第二讲 · Pr[M=m | C=c] = Pr[M=m]
      </footer>
    </div>
  )
}
