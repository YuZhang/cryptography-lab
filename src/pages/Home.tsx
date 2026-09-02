import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  // 主题偏好持久化：首次读取 localStorage，之后每次切换都写入
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

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
            <div className="hidden gap-5 text-sm text-muted-foreground sm:flex">
              {nav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="transition-colors hover:text-amber-600 dark:hover:text-amber-300"
                >
                  {n.label}
                </a>
              ))}
            </div>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 border-border"
              onClick={() => setDark((d) => !d)}
              aria-label="切换深浅色主题"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6">
        <Hero />
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
