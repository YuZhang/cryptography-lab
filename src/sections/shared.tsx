import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/** 章节外壳：编号 + 标题 + 副标题 */
export function Section({
  id,
  index,
  title,
  subtitle,
  children,
}: {
  id: string
  index: string
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border py-16 first:border-t-0">
      <div className="mb-8">
        <Badge
          variant="outline"
          className="mb-3 border-amber-500/40 text-amber-600 dark:text-amber-400"
        >
          {index}
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
        {subtitle && <p className="mt-2 max-w-3xl text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

/** 页内锚点导航：HashRouter 下不能用 href="#id"（会被当成路由），改用滚动 */
export function NavAnchor({
  id,
  label,
  className,
  children,
}: {
  id: string
  label?: string
  className?: string
  children?: ReactNode
}) {
  return (
    <a
      href={`#${id}`}
      onClick={(e) => {
        e.preventDefault()
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }}
      className={className}
    >
      {children ?? label}
    </a>
  )
}

/** 公式展示块 */
export function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="my-3 inline-block rounded-lg border border-border bg-muted px-4 py-2 font-mono text-amber-700 dark:text-amber-300">
      {children}
    </div>
  )
}

/** 等宽密文/明文展示，可逐字符高亮 */
export function CipherText({
  text,
  highlight,
  className,
}: {
  text: string
  highlight?: (ch: string, i: number) => string | undefined
  className?: string
}) {
  return (
    <div
      className={cn(
        'break-all rounded-lg border border-border bg-muted/60 p-4 font-mono text-lg leading-relaxed tracking-wider',
        className
      )}
    >
      {text.split('').map((ch, i) => (
        <span key={i} className={highlight?.(ch, i)}>
          {ch}
        </span>
      ))}
    </div>
  )
}

/** 字母表映射条：上行明文，下行密文 */
export function AlphabetMap({ top, bottom }: { top: string; bottom: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card p-3">
      <div className="flex min-w-max flex-col gap-1 font-mono text-sm">
        {[top, bottom].map((row, r) => (
          <div key={r} className="flex gap-[2px]">
            {row.split('').map((ch, i) => (
              <span
                key={i}
                className={cn(
                  'flex h-8 w-7 items-center justify-center rounded',
                  r === 0
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                )}
              >
                {ch}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
