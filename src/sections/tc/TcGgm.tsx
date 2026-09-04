import { useMemo, useState } from 'react'
import { CornerDownLeft, CornerDownRight, TreePine } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Formula, Section } from '../shared'
import { ggmPath, ggmTree, hex2 } from '@/lib/owf'
import { cn } from '@/lib/utils'

const DEPTH = 4
const NBITS = 8

export default function TcGgm() {
  const [keyHex, setKeyHex] = useState('5A')
  const [bits, setBits] = useState('011')
  const key = parseInt(keyHex, 16)
  const validKey = !isNaN(key) && key <= 0xff
  const validBits = /^[01]{1,4}$/.test(bits)

  const tree = useMemo(
    () => (validKey ? ggmTree(key, DEPTH, NBITS) : []),
    [key, validKey]
  )
  const path = useMemo(
    () => (validKey && validBits ? ggmPath(key, bits, NBITS) : []),
    [key, bits, validKey, validBits]
  )
  const onPath = (level: number, index: number) =>
    path.some((n) => n.level === level && n.index === index)

  return (
    <Section
      id="tc-ggm"
      index="04 · PRG ⇒ PRF"
      title="GGM 二叉树：一棵树就是一个函数"
      subtitle="Goldreich-Goldwasser-Micali：把 PRG 的输出对半劈开当两个新种子，递归 n 层得到 2ⁿ 片叶子。密钥是树根，输入的每个比特是寻路指令——0 走左，1 走右。整棵树无需存储，沿路径重新计算即可。"
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-border bg-card/60 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TreePine className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
              寻路演示（深度 {DEPTH}，叶子 = F_k(x)）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>F_k(x₁…xₙ) = G_(xₙ)( … G_(x₂)(G_(x₁)(k)) … )</Formula>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">密钥 k（00–FF）</label>
                <Input
                  value={keyHex}
                  onChange={(e) => setKeyHex(e.target.value)}
                  className="border-input bg-background font-mono text-foreground"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  输入 x（1–4 位比特串）
                </label>
                <Input
                  value={bits}
                  onChange={(e) => setBits(e.target.value.replace(/[^01]/g, '').slice(0, DEPTH))}
                  className="border-input bg-background font-mono text-foreground"
                />
              </div>
            </div>
            {(!validKey || !validBits) && (
              <p className="text-xs text-red-600 dark:text-red-400">
                密钥需为 00–FF，输入需为 1–4 位的 0/1 串
              </p>
            )}

            {tree.length > 0 && (
              <div className="space-y-2 overflow-x-auto rounded-lg border border-border bg-muted/40 p-4">
                {tree.map((row, d) => (
                  <div key={d} className="flex min-w-max items-center gap-1">
                    <span className="w-10 shrink-0 text-[10px] text-muted-foreground">
                      {d === 0 ? '根' : d === DEPTH ? '叶子' : `第${d}层`}
                    </span>
                    <div className="flex flex-1 justify-around gap-1">
                      {row.map((node) => (
                        <span
                          key={node.index}
                          className={cn(
                            'rounded border px-1.5 py-0.5 font-mono text-[10px] transition-all',
                            onPath(d, node.index)
                              ? 'border-fuchsia-500 bg-fuchsia-500/20 font-bold text-fuchsia-700 dark:text-fuchsia-300'
                              : 'border-border/60 text-muted-foreground/70'
                          )}
                        >
                          {hex2(node.value)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {path.length > 1 && (
              <div className="space-y-1 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/5 p-3 font-mono text-xs">
                {path.slice(1).map((n, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground">
                    {bits[i] === '0' ? (
                      <CornerDownLeft className="h-3 w-3 text-fuchsia-600 dark:text-fuchsia-400" />
                    ) : (
                      <CornerDownRight className="h-3 w-3 text-fuchsia-600 dark:text-fuchsia-400" />
                    )}
                    第 {i + 1} 比特 = {bits[i]} → 走{bits[i] === '0' ? '左（G₀）' : '右（G₁）'}，得{' '}
                    <span className="text-foreground">0x{hex2(n.value)}</span>
                  </div>
                ))}
                <div className="border-t border-fuchsia-500/30 pt-1 text-fuchsia-700 dark:text-fuchsia-300">
                  F_k({bits}) = 0x{hex2(path[path.length - 1].value)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">讲义例子</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                F_k(<span className="font-mono text-foreground">011</span>) =
                G₁(G₁(G₀(k)))——根出发：第一比特 0 向左，接着两个 1 连续向右。
                把输入改成 011 走一遍试试。
              </p>
              <p>
                指数威力：深度 n 的树有
                <span className="text-foreground"> 2ⁿ 片叶子 = 2ⁿ 个输入</span>，
                而每次查询只需计算 n 次 PRG——用多项式时间访问指数大小的「随机函数表」。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">为什么这是 PRF？</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                直觉：要区分 F_k 与真随机函数，就得在某层把 PRG 的输出和真随机串区分开——
                混合论证逐层替换，每层都归约到 PRG 的伪随机性。
              </p>
              <p className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
                定理（GGM）：存在扩展因子 2n 的 PRG ⇒ 存在 PRF。
              </p>
              <p className="text-xs">
                同一个 k 决定整棵树；换掉 k 就换了一个完全无关的函数——这正是 PRF 的语义。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
