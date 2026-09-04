import { Link } from 'react-router'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { NavAnchor } from '@/sections/shared'
import Cs2Hero from '@/sections/cs2/Cs2Hero'
import Cs2Mult from '@/sections/cs2/Cs2Mult'
import Cs2Cpa from '@/sections/cs2/Cs2Cpa'
import Cs2Modes from '@/sections/cs2/Cs2Modes'
import Cs2Cca from '@/sections/cs2/Cs2Cca'
import Cs2Summary from '@/sections/cs2/Cs2Summary'

const nav = [
  { href: '#cs2-mult', label: '多重加密' },
  { href: '#cs2-cpa', label: 'CPA 安全' },
  { href: '#cs2-modes', label: '操作模式' },
  { href: '#cs2-cca', label: 'CCA 安全' },
  { href: '#cs2-summary', label: '总结' },
]

export default function CpaCca() {
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
            className="flex items-center gap-1 font-mono text-sm font-semibold text-violet-600 transition-colors hover:text-violet-500 dark:text-violet-400"
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
                  className="transition-colors hover:text-violet-600 dark:hover:text-violet-300"
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
        <Cs2Hero />
        <Cs2Mult />
        <Cs2Cpa />
        <Cs2Modes />
        <Cs2Cca />
        <Cs2Summary />
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        CPA / CCA 安全交互实验室 · 基于《密码学导论》课程讲义第三讲（下） · CCA 安全 = 不可区分 +
        不可锻造
      </footer>
    </div>
  )
}
