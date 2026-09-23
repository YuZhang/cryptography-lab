import { Link } from 'react-router'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { NavAnchor } from '@/sections/shared'
import AeHero from '@/sections/ae/AeHero'
import AeCombine from '@/sections/ae/AeCombine'
import AeImpl from '@/sections/ae/AeImpl'
import AeDet from '@/sections/ae/AeDet'
import AeDisk from '@/sections/ae/AeDisk'
import AeKdf from '@/sections/ae/AeKdf'
import AeSummary from '@/sections/ae/AeSummary'

const nav = [
  { href: '#ae-combine', label: '组合对决' },
  { href: '#ae-impl', label: '实现陷阱' },
  { href: '#ae-det', label: '确定性加密' },
  { href: '#ae-disk', label: 'XTS' },
  { href: '#ae-kdf', label: 'KDF' },
  { href: '#ae-summary', label: '总结' },
]

export default function AuthenticatedEncryption() {
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
            className="flex items-center gap-1 font-mono text-sm font-semibold text-orange-600 transition-colors hover:text-orange-500 dark:text-orange-400"
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
                  className="transition-colors hover:text-orange-600 dark:hover:text-orange-300"
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
        <AeHero />
        <AeCombine />
        <AeImpl />
        <AeDet />
        <AeDisk />
        <AeKdf />
        <AeSummary />
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        CCA 与认证加密交互实验室 · 基于《密码学导论》课程讲义第七讲 · 先加密后认证，先验证后解密
      </footer>
    </div>
  )
}
