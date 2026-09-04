import { Link } from 'react-router'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { NavAnchor } from '@/sections/shared'
import TcHero from '@/sections/tc/TcHero'
import TcOwf from '@/sections/tc/TcOwf'
import TcHcp from '@/sections/tc/TcHcp'
import TcBm from '@/sections/tc/TcBm'
import TcGgm from '@/sections/tc/TcGgm'
import TcLr from '@/sections/tc/TcLr'
import TcSummary from '@/sections/tc/TcSummary'

const nav = [
  { href: '#tc-owf', label: '单向函数' },
  { href: '#tc-hcp', label: '核心断言' },
  { href: '#tc-bm', label: 'BM 生成器' },
  { href: '#tc-ggm', label: 'GGM 树' },
  { href: '#tc-lr', label: 'Luby-Rackoff' },
  { href: '#tc-summary', label: '构造闭环' },
]

export default function TheoreticalConstructions() {
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
            className="flex items-center gap-1 font-mono text-sm font-semibold text-fuchsia-600 transition-colors hover:text-fuchsia-500 dark:text-fuchsia-400"
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
                  className="transition-colors hover:text-fuchsia-600 dark:hover:text-fuchsia-300"
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
        <TcHero />
        <TcOwf />
        <TcHcp />
        <TcBm />
        <TcGgm />
        <TcLr />
        <TcSummary />
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        伪随机对象理论构造交互实验室 · 基于《密码学导论》课程讲义第五讲 · OWF 存在 ⟺
        私钥密码学存在
      </footer>
    </div>
  )
}
