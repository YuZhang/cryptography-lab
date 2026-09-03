import { useMemo, useState } from 'react'
import { Dices, FlaskConical, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { bitStats, genBits, GEN_INFO, prgStream, type GenKind } from '@/lib/prg'
import { bytesToHex } from '@/lib/otp'
import { Formula, Section } from '../shared'
import { cn } from '@/lib/utils'

const KINDS: GenKind[] = ['crypto', 'biased', 'lcg-lowbit']
const N_BITS = 128

export default function CsPrg() {
  const [kind, setKind] = useState<GenKind>('crypto')
  const [round, setRound] = useState(0)
  const bits = useMemo(() => genBits(kind, N_BITS), [kind, round])
  const stats = useMemo(() => bitStats(bits), [bits])

  // 种子空间蛮力演示：8 比特种子 → 8 字节输出
  const [targetSeed] = useState(() => Math.floor(Math.random() * 256))
  const target = useMemo(() => prgStream(targetSeed, 8), [targetSeed])
  const [crackResult, setCrackResult] = useState<{ seed: number; tried: number; ms: number } | null>(null)

  function bruteForceSeed() {
    const t0 = performance.now()
    const targetHex = bytesToHex(target)
    let found = -1
    let tried = 0
    for (let s = 0; s < 256; s++) {
      tried++
      if (bytesToHex(prgStream(s, 8)) === targetHex) {
        found = s
        break
      }
    }
    setCrackResult({ seed: found, tried, ms: performance.now() - t0 })
  }

  const balancePass = stats.balance < 0.2
  const runPass = stats.longestRun <= 12

  return (
    <Section
      id="cs-prg"
      index="02 · 伪随机性"
      title="伪随机生成器 PRG 与区分器"
      subtitle="真随机无法由确定性机制产生——但「伪随机」对于算力有限的观察者来说看起来就是真随机。注意：一个固定的字符串谈不上随机与否，随机性描述的是产生它的过程。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 统计测试 */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FlaskConical className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              区分器动手玩：统计测试
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {KINDS.map((kd) => (
                <button
                  key={kd}
                  onClick={() => setKind(kd)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs transition-colors',
                    kind === kd
                      ? 'border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300'
                      : 'border-border text-muted-foreground hover:border-sky-500/40'
                  )}
                >
                  {GEN_INFO[kd].name}
                </button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => setRound((r) => r + 1)}
              >
                <Dices className="mr-1 h-3.5 w-3.5" /> 重新生成
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{GEN_INFO[kind].desc}</p>

            {/* 比特网格：128 bit = 16×8 */}
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div
                className="grid gap-[2px]"
                style={{ gridTemplateColumns: 'repeat(16, minmax(0,1fr))' }}
              >
                {bits.map((b, i) => (
                  <div
                    key={i}
                    className={cn(
                      'aspect-square rounded-[2px]',
                      b ? 'bg-sky-500' : 'bg-zinc-300 dark:bg-zinc-700'
                    )}
                  />
                ))}
              </div>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                128 比特输出（蓝 = 1）
              </p>
            </div>

            {/* 两个统计测试 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs text-muted-foreground">测试一：0/1 均衡</div>
                <div className="mt-1 font-mono text-sm text-foreground">
                  {stats.zeros} 零 / {stats.ones} 壹
                </div>
                <div className={cn('mt-1 text-xs font-medium', balancePass ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                  {balancePass ? '✓ 通过' : '✗ 失败：偏差过大'}
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs text-muted-foreground">测试二：最长连跑</div>
                <div className="mt-1 font-mono text-sm text-foreground">
                  {stats.longestRun} 位
                </div>
                <div className={cn('mt-1 text-xs font-medium', runPass ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                  {runPass ? '✓ 通过' : '✗ 失败：连跑过长'}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-3 text-xs leading-relaxed text-muted-foreground">
              <span className="text-foreground">两个教训：</span>
              偏差源会被测试一当场抓获；而 LCG 最低位
              <span className="text-foreground">两个测试全过</span>
              ，下一比特却永远可预测——「多少测试才足够」无法回答。
              姚期智证明：通过所有统计测试 ⟺ 下一比特不可预测，于是伪随机性有了严格定义：
              没有任何 PPT 区分器能把它和真随机分开（像一场针对随机性的图灵测试）。
            </div>
          </CardContent>
        </Card>

        {/* PRG 定义 + 种子空间 */}
        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">PRG 定义</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                确定性多项式时间算法 G: {'{'}0,1{'}'}ⁿ → {'{'}0,1{'}'}^ℓ⁽ⁿ⁾ 是伪随机生成器，若：
              </p>
              <Formula>延展：ℓ(n) &gt; n</Formula>
              <Formula>|Pr[D(r)=1] − Pr[D(G(s))=1]| ≤ negl(n)</Formula>
              <p>
                r 是真随机串、 s 是随机种子。区分器 D 输入一个比特串、输出一个比特——
                输出 1 不代表「是随机的」，两个概率之差小才是重点。
                存在性：若单向函数存在（或 P ≠ NP），则 PRG 存在。
              </p>
              <p className="text-xs">
                反面教材：C 语言的 <code>random()</code>、Netscape 早期版本的可预测种子，
                以及 2008 年 Debian 为消除编译警告误删一行代码导致的 OpenSSL 随机数灾难——
                它们的输出都是可预测的。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Search className="h-5 w-5 text-red-600 dark:text-red-400" />
                充分种子空间：蛮力枚举演示
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                玩具 PRG 的种子只有 <span className="font-mono text-foreground">8 比特</span>
                （256 个）。给你一段输出，穷举所有种子即可认出它是伪随机：
              </p>
              <div className="rounded-lg border border-border bg-muted/60 p-3 font-mono text-xs text-amber-700 dark:text-amber-300">
                挑战输出：{bytesToHex(target)}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                onClick={bruteForceSeed}
              >
                枚举全部 256 个种子
              </Button>
              {crackResult && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 font-mono text-sm text-red-700 dark:text-red-300">
                  试了 {crackResult.tried} 个种子即命中：seed = {crackResult.seed}，耗时{' '}
                  {crackResult.ms.toFixed(1)} ms
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                延展到 2n 的输出串中，PRG 只能产生其中 2⁻ⁿ 的比例（稀疏输出）；
                只要种子空间够大，蛮力枚举就不可行——这就是「充分种子空间」原则。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
