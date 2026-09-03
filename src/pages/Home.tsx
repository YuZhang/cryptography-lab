import { Link } from 'react-router'
import { ArrowRight, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { NavAnchor } from '@/sections/shared'
import Hero from '@/sections/Hero'
import CaesarSection from '@/sections/CaesarSection'
import ShiftSection from '@/sections/ShiftSection'
import SubstitutionSection from '@/sections/SubstitutionSection'
import VigenereSection from '@/sections/VigenereSection'
import StoriesSection from '@/sections/StoriesSection'
import PrinciplesSection from '@/sections/PrinciplesSection'

const nav = [
  { href: '#caesar', label: '凯撒密码' },
  { href: '#shift', label: '移位密码' },
  { href: '#substitution', label: '单表替换' },
  { href: '#vigenere', label: '维吉尼亚' },
  { href: '#stories', label: '历史趣闻' },
  { href: '#principles', label: '总结' },
]

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
          <div className="flex items-center gap-5">
            <div className="hidden gap-5 text-sm text-muted-foreground lg:flex">
              {nav.map((n) => (
                <NavAnchor
                  key={n.href}
                  id={n.href.slice(1)}
                  label={n.label}
                  className="transition-colors hover:text-amber-600 dark:hover:text-amber-300"
                />
              ))}
            </div>
            <Link
              to="/perfect-secrecy"
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-500/15 dark:text-emerald-300"
            >
              第二讲 · 完美保密 →
            </Link>
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
        <Hero />
        <Link to="/perfect-secrecy" className="group block">
          <div className="mb-2 flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/5 px-6 py-4 transition-colors hover:bg-emerald-500/10">
            <div>
              <div className="text-xs font-medium tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
                下一讲
              </div>
              <div className="mt-1 text-lg font-bold text-foreground">
                第二讲 · 完美保密交互实验室
              </div>
              <div className="mt-0.5 text-sm text-muted-foreground">
                一次一密、香农定理、|K| ≥ |M| 的代价，还有你来当 Eve 的窃听不可区分实验 →
              </div>
            </div>
            <ArrowRight className="h-6 w-6 shrink-0 text-emerald-600 transition-transform group-hover:translate-x-1 dark:text-emerald-400" />
          </div>
        </Link>
        <CaesarSection />
        <ShiftSection />
        <SubstitutionSection />
        <VigenereSection />
        <StoriesSection />
        <PrinciplesSection />
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        古典密码学交互实验室 · 基于《密码学导论》课程讲义 · Kerckhoffs 原则：算法公开，密钥保密
      </footer>
    </div>
  )
}
