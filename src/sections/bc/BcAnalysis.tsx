import { useMemo, useState } from 'react'
import { Grid3X3, Waves } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Formula, Section } from '../shared'
import { bin4, diffDistTable, hex1, latEntry, linearApproxTable } from '@/lib/blockcipher'
import { cn } from '@/lib/utils'

/** 16×16 热力图 */
function Heatmap({
  table,
  maxAbs,
  selected,
  onSelect,
  format,
}: {
  table: number[][]
  maxAbs: number
  selected: [number, number]
  onSelect: (r: number, c: number) => void
  format: (v: number) => string
}) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        <div className="flex">
          <div className="h-6 w-8" />
          {table[0].map((_, c) => (
            <div key={c} className="flex h-6 w-7 items-center justify-center font-mono text-[10px] text-muted-foreground">
              {hex1(c)}
            </div>
          ))}
        </div>
        {table.map((row, r) => (
          <div key={r} className="flex">
            <div className="flex h-7 w-8 items-center justify-center font-mono text-[10px] text-muted-foreground">
              {hex1(r)}
            </div>
            {row.map((v, c) => {
              const sel = selected[0] === r && selected[1] === c
              const intensity = Math.abs(v) / maxAbs
              return (
                <button
                  key={c}
                  onClick={() => onSelect(r, c)}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center border font-mono text-[10px] transition-colors',
                    sel
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : 'border-border/50 hover:border-rose-400'
                  )}
                  style={{
                    backgroundColor:
                      v === 0
                        ? 'transparent'
                        : `rgba(244, 63, 94, ${0.08 + intensity * 0.75})`,
                    color: intensity > 0.45 ? '#fff' : undefined,
                  }}
                >
                  {format(v)}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BcAnalysis() {
  const lat = useMemo(() => linearApproxTable(), [])
  const ddt = useMemo(() => diffDistTable(), [])
  const [latSel, setLatSel] = useState<[number, number]>([0x6, 0xb])
  const [ddtSel, setDdtSel] = useState<[number, number]>([0xb, 0x2])

  const latDetail = latEntry(latSel[0], latSel[1])
  const ddtCount = ddt[ddtSel[0]][ddtSel[1]]

  return (
    <Section
      id="bc-analysis"
      index="05 · 统计密码分析"
      title="线性分析与差分分析"
      subtitle="S 盒是块密码唯一的非线性部件，也是被有意设计成「难以描述」的部件。但统计学家不问原理，只数频率：输入输出的某些比特异或之间若存在偏差，S 盒就被「穿透」了。这两张表，一张 1990 年把 DES 逼上绝路，一张是现代分组密码设计的必修课。"
    >
      <Tabs defaultValue="linear">
        <TabsList className="border-border">
          <TabsTrigger value="linear">线性分析（KPA）</TabsTrigger>
          <TabsTrigger value="diff">差分分析（CPA）</TabsTrigger>
        </TabsList>

        <TabsContent value="linear" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border bg-card/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Grid3X3 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  线性近似表（LAT）
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Formula>Pr[⟨a,x⟩ = ⟨b,S(x)⟩] = 1/2 + p · 表项 = 偏差 = 命中数 − 8</Formula>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  行号 = 输入掩码 a（选中哪些 x 比特异或），列号 = 输出掩码 b。点击格子看详情。
                  颜色越深偏差越大。
                </p>
                <Heatmap
                  table={lat}
                  maxAbs={8}
                  selected={latSel}
                  onSelect={(r, c) => setLatSel([r, c])}
                  format={(v) => (v === 0 ? '·' : String(v))}
                />
                <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-sm">
                  <div className="text-muted-foreground">
                    a = {hex1(latSel[0])}（{bin4(latSel[0])}）· b = {hex1(latSel[1])}（{bin4(latSel[1])}）
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    命中 <span className="text-foreground">{latDetail.count}/16</span> · 偏差{' '}
                    <span className={latDetail.bias !== 0 ? 'text-rose-700 dark:text-rose-300' : 'text-foreground'}>
                      {latDetail.bias > 0 ? '+' : ''}
                      {latDetail.bias}
                    </span>{' '}
                    · 概率 <span className="text-foreground">{latDetail.prob.toFixed(3)}</span>
                  </div>
                  {latSel[0] === 0x6 && latSel[1] === 0xb && (
                    <div className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                      讲义同款：X₂⊕X₃ 与 Y₁⊕Y₃⊕Y₄ 在 12/16 的输入上相等，偏差 +4
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/60">
              <CardHeader>
                <CardTitle className="text-foreground">从一张表到破解：三步走</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <ol className="list-decimal space-y-2 pl-5">
                  <li>
                    <span className="text-foreground">穿透 S 盒</span>：构造 LAT，挑偏差大的格子——
                    比如 (6, B) 给出 X₂⊕X₃ = Y₁⊕Y₃⊕Y₄ 有 3/4 概率成立。
                  </li>
                  <li>
                    <span className="text-foreground">链接近似</span>：把各轮 S 盒的线性近似串成前
                    r−1 轮的整体关系，得到"明文若干比特 ≈ 最后一轮输入若干比特"，
                    密钥比特异或成一个固定未知量 Σk——是 0 是 1 无所谓，关系都成立。
                  </li>
                  <li>
                    <span className="text-foreground">反推末轮</span>：从密文倒推最后一轮，
                    只需猜末轮子密钥的<span className="text-foreground">少数几个比特</span>
                    （讲义例子只需 2⁸），用大量已知明密文对做统计检验，筛出真密钥，逐段蚕食全部密钥。
                  </li>
                </ol>
                <p className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
                  只需已知明文（KPA），无需选择明文。1993 年松井充用 2⁴³ 个明密文对攻破了完整
                  DES——线性分析是第一个对 DES 实测可行的攻击。
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diff" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border bg-card/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Waves className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  差分分布表（DDT）
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Formula>ΔX = x₁⊕x₂ · ΔY = S(x₁)⊕S(x₂) · 表项 = 出现次数</Formula>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  行号 = 输入差 ΔX，列号 = 输出差 ΔY。理想 S 盒每格应接近 1（概率
                  2⁻⁴）；出现 8 次意味着概率 1/2 的差分通道——就是漏洞。
                </p>
                <Heatmap
                  table={ddt}
                  maxAbs={16}
                  selected={ddtSel}
                  onSelect={(r, c) => setDdtSel([r, c])}
                  format={(v) => (v === 0 ? '·' : String(v))}
                />
                <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-sm">
                  <div className="text-muted-foreground">
                    ΔX = {hex1(ddtSel[0])}（{bin4(ddtSel[0])}）→ ΔY = {hex1(ddtSel[1])}（{bin4(ddtSel[1])}）
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    出现 <span className={ddtCount > 2 ? 'text-rose-700 dark:text-rose-300' : 'text-foreground'}>
                      {ddtCount}/16
                    </span> 次 · 概率 <span className="text-foreground">{(ddtCount / 16).toFixed(3)}</span>
                    {ddtCount / 16 > 0.0625 && ' ≫ 2⁻⁴ ≈ 0.0625'}
                  </div>
                  {ddtSel[0] === 0xb && ddtSel[1] === 0x2 && (
                    <div className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                      讲义同款：ΔX=1011 时 ΔY=0010 出现 8 次，概率 1/2——一条高产差分通道
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/60">
              <CardHeader>
                <CardTitle className="text-foreground">差分分析的三步走</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <ol className="list-decimal space-y-2 pl-5">
                  <li>
                    <span className="text-foreground">穿透 S 盒</span>：构造 DDT，找出高概率的
                    ΔX → ΔY 通道。
                  </li>
                  <li>
                    <span className="text-foreground">构造差分特征</span>：把通道串成前 r−1
                    轮的明文差分 → 末轮输入差分关系。异或差分<span className="text-foreground">
                    穿过密钥混合不变</span>（(x⊕k)⊕(x'⊕k) = x⊕x'），所以全程不用关心子密钥。
                  </li>
                  <li>
                    <span className="text-foreground">反推末轮</span>：选择明文构造特定 ΔP
                    （所以需要 CPA），猜末轮子密钥的少数比特，统计满足差分特征的次数筛出真密钥。
                  </li>
                </ol>
                <p className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
                  1990 年 Biham & Shamir 发表：完整 DES 在 2⁴⁷ 个选择明文下可破。
                  事后揭秘：DES 的 S 盒当年就被 NSA 优化过以抵抗差分分析—— IBM 和 NSA
                  比学界早 15 年知道这一招。
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Section>
  )
}
