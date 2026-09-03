import { Link } from 'react-router'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { NavAnchor } from '@/sections/shared'
import CsHero from '@/sections/cs/CsHero'
import CsNegligible from '@/sections/cs/CsNegligible'
import CsPrg from '@/sections/cs/CsPrg'
import CsReduction from '@/sections/cs/CsReduction'
import CsSummary from '@/sections/cs/CsSummary'

const nav = [
  { href: '#cs-relax', label: '计算安全' },
  { href: '#cs-prg', label: '伪随机性' },
  { href: '#cs-reduction', label: '构造与证明' },
  { href: '#cs-summary', label: '总结' },
]

export default function ComputationalSecurity() {
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
            className="flex items-center gap-1 font-mono text-sm font-semibold text-sky-600 transition-colors hover:text-sky-500 dark:text-sky-400"
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
                  className="transition-colors hover:text-sky-600 dark:hover:text-sky-300"
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
        <CsHero />
        <CsNegligible />
        <CsPrg />
        <CsReduction />
        <CsSummary />
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        计算安全与伪随机交互实验室 · 基于《密码学导论》课程讲义第三讲 · Pr[成功] ≤ 1/2 + negl(n)
      </footer>
    </div>
  )
}
