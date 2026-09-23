import { Link } from 'react-router'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { NavAnchor } from '@/sections/shared'
import MhHero from '@/sections/mh/MhHero'
import MhForge from '@/sections/mh/MhForge'
import MhVariable from '@/sections/mh/MhVariable'
import MhBirthday from '@/sections/mh/MhBirthday'
import MhHmac from '@/sections/mh/MhHmac'
import MhSuf from '@/sections/mh/MhSuf'
import MhSummary from '@/sections/mh/MhSummary'

const nav = [
  { href: '#mh-forge', label: '伪造实操' },
  { href: '#mh-variable', label: '变长 MAC' },
  { href: '#mh-birthday', label: '生日悖论' },
  { href: '#mh-hmac', label: 'HMAC' },
  { href: '#mh-suf', label: '信息论 MAC' },
  { href: '#mh-summary', label: '总结' },
]

export default function MacHash() {
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
            className="flex items-center gap-1 font-mono text-sm font-semibold text-teal-600 transition-colors hover:text-teal-500 dark:text-teal-400"
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
                  className="transition-colors hover:text-teal-600 dark:hover:text-teal-300"
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
        <MhHero />
        <MhForge />
        <MhVariable />
        <MhBirthday />
        <MhHmac />
        <MhSuf />
        <MhSummary />
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        消息认证与哈希交互实验室 · 基于《密码学导论》课程讲义第六讲 · 不要自己实现密码学
      </footer>
    </div>
  )
}
