import { useMemo, useState } from 'react'
import { Ban, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Section } from '../shared'
import { cn } from '@/lib/utils'

// 小例子：M = {0,1,2,3}，K = {0,1}，Enc_k(m) = m + k (mod 4)
const M = [0, 1, 2, 3]
const K = [0, 1]

export default function PsLimit() {
  const [c, setC] = useState(2)

  // M(c)：能用某个密钥从 c 解密出的全部明文
  const reachable = useMemo(() => K.map((k) => (c - k + 4) % 4), [c])
  const unreachable = M.filter((m) => !reachable.includes(m))

  return (
    <Section
      id="ps-limit"
      index="03 · 局限与判据"
      title="完美保密的代价与香农定理"
      subtitle="一次一密的密钥必须和明文一样长——这不是实现上的懒惰，而是完美保密的内在代价。香农定理则给出了可操作的完美保密判据。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* |K| ≥ |M| 反证法演示 */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Ban className="h-5 w-5 text-red-600 dark:text-red-400" />
              定理：|K| ≥ |M|（反证法动手走一遍）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              设明文空间 M = {'{'}0,1,2,3{'}'}，密钥空间 K = {'{'}0,1{'}'}（|K| &lt;
              |M|），方案 Encₖ(m) = m + k (mod 4)。选一个密文 c，看看它能「解释」成哪些明文：
            </p>
            <div className="flex gap-2">
              {M.map((cc) => (
                <button
                  key={cc}
                  onClick={() => setC(cc)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg border font-mono text-lg transition-colors',
                    c === cc
                      ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      : 'border-border bg-card text-muted-foreground hover:border-amber-500/40'
                  )}
                >
                  {cc}
                </button>
              ))}
              <span className="self-center text-xs text-muted-foreground">← 点击选择密文 c</span>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="mb-2 text-xs text-muted-foreground">
                M(c) = {'{'} m̂ : m̂ = Decₖ(c)，k ∈ K {'}'}——每个密钥至多解出一个明文：
              </div>
              <div className="flex gap-2">
                {M.map((m) => {
                  const ok = reachable.includes(m)
                  return (
                    <div
                      key={m}
                      className={cn(
                        'flex h-12 w-12 flex-col items-center justify-center rounded-lg border font-mono',
                        ok
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400'
                      )}
                    >
                      <span className="text-lg">{m}</span>
                      <span className="text-[9px]">{ok ? '可达' : '不可达'}</span>
                    </div>
                  )
                })}
              </div>
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                |M(c)| = {reachable.length} ≤ |K| = {K.length} &lt; |M| = {M.length}
              </p>
            </div>

            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm leading-relaxed text-red-700 dark:text-red-300">
              明文 {unreachable.join('、')} 不可能产生密文 {c}，于是 Pr[M={unreachable[0]} | C={c}]
              = 0 ≠ Pr[M={unreachable[0]}] &gt; 0——完美保密被破坏。
              结论：任何完美保密方案都必须满足 |K| ≥ |M|。
            </div>
          </CardContent>
        </Card>

        {/* 香农定理 */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              香农定理：可操作的完美保密判据
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              定义中「M 上任意概率分布」难以直接检验。香农定理说：当 |M| = |K| = |C|
              时，完美保密 <span className="text-foreground">当且仅当</span>：
            </p>
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <div className="mb-1 font-mono text-sm text-foreground">条件 ① 密钥均匀</div>
                <p className="text-xs text-muted-foreground">
                  每个密钥以 1/|K| 的概率被 Gen 选出。回到上面的滑块实验：q 偏离 50%
                  的那一刻完美保密就瓦解——正是这条。
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <div className="mb-1 font-mono text-sm text-foreground">
                  条件 ② ∀m, ∀c，存在唯一 k 使 Encₖ(m) = c
                </div>
                <p className="text-xs text-muted-foreground">
                  每个明文都可以被加密成每个密文，且「作案密钥」唯一——密文完全不指认明文。
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <div className="mb-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                用一次一密验证两条（M = K = C = {'{'}0,1{'}'}ⁿ）：
              </div>
              <div className="space-y-1 font-mono text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ① k 逐位均匀随机生成 ✓
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ② 给定 (m, c)，唯一的 k = m ⊕ c ✓
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                对照：上面 |K| &lt; |M| 的小例子连条件②的前提都不满足——
                密文 {c} 面前的可达明文凑不齐整个 M，唯一密钥自然无从谈起。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
