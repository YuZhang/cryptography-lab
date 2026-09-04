import { useMemo, useState } from 'react'
import { Activity, Snowflake } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Section } from '../shared'
import {
  HEYS_SBOX,
  IDENTITY_SBOX,
  avalancheByStage,
  sacSample,
} from '@/lib/blockcipher'
import { xorshift32 } from '@/lib/prg'

const TOOLTIP_STYLE = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 8,
  fontSize: 12,
  color: 'hsl(var(--popover-foreground))',
}

export default function BcAvalanche() {
  const [bit, setBit] = useState(0)
  const [rounds, setRounds] = useState(4)
  const [sboxName, setSboxName] = useState<'heys' | 'identity'>('heys')
  const sbox = sboxName === 'heys' ? HEYS_SBOX : IDENTITY_SBOX

  // 逐阶段扩散：翻转 1 比特后，每个阶段有多少比特不同
  const spread = useMemo(
    () => avalancheByStage(0x26b9, bit, 0x3a91, rounds, sbox).filter((_, i) => i > 0),
    [bit, rounds, sbox]
  )

  // 严格雪崩条件采样（固定种子，结果可复现）
  const sacData = useMemo(() => {
    const rng = xorshift32(0xa9a1 + bit * 131 + rounds * 17 + (sboxName === 'heys' ? 0 : 7))
    const rand = () => rng() / 0xffffffff
    const hist = sacSample(bit, 0x3a91, rounds, 2000, sbox, rand)
    return hist.map((count, i) => ({ bits: i, count }))
  }, [bit, rounds, sbox, sboxName])
  const mean =
    sacData.reduce((s, d) => s + d.bits * d.count, 0) /
    Math.max(1, sacData.reduce((s, d) => s + d.count, 0))

  return (
    <Section
      id="bc-avalanche"
      index="02 · 雪崩效应"
      title="设计原则 2：雪崩效应"
      subtitle="改变输入的一个比特，应当影响输出的每一个比特。严格雪崩条件：翻转任一输入比特，每个输出比特都以 50% 概率翻转——1 比特的差异要像雪崩一样滚成 16 比特的混乱。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Snowflake className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              逐轮扩散：1 比特滚成雪崩
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                翻转明文的第 {bit} 比特（0–15）
              </label>
              <Slider value={[bit]} min={0} max={15} step={1} onValueChange={([v]) => setBit(v)} />
            </div>
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">轮数 R = {rounds}</label>
              <Slider value={[rounds]} min={1} max={4} step={1} onValueChange={([v]) => setRounds(v)} />
            </div>
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">S 盒</label>
              <ToggleGroup
                type="single"
                value={sboxName}
                onValueChange={(v) => v && setSboxName(v as 'heys' | 'identity')}
                className="justify-start"
              >
                <ToggleGroupItem value="heys" className="border-border">Heys S 盒（非线性）</ToggleGroupItem>
                <ToggleGroupItem value="identity" className="border-border">恒等 S 盒（线性）</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer>
                <BarChart data={spread} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#71717a', fontSize: 9 }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} domain={[0, 16]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: 'hsl(var(--popover-foreground))' }} />
                  <Bar dataKey="diff" name="不同比特数" radius={[3, 3, 0, 0]}>
                    {spread.map((d, i) => (
                      <Cell
                        key={i}
                        fill={
                          d.diff >= 12 ? '#e11d48' : d.diff >= 6 ? '#f43f5e' : d.diff >= 2 ? '#fb7185' : '#fda4af'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {sboxName === 'heys'
                ? '1 个比特进 S 盒至少变 2 个比特，P 盒再把它们撒向不同 S 盒——变化数每轮约翻倍，3 轮后逼近 16 比特全覆盖。'
                : '恒等 S 盒是线性的：1 比特变化永远只是 1 比特，P 盒只能搬动它——扩散彻底失败。'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              严格雪崩条件：2000 次随机采样
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              随机取 2000 个明文，各自翻转第 {bit} 比特，统计密文变化比特数的分布。
              理想情况应以 <span className="text-foreground">8/16 = 50%</span> 为中心：
            </p>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <BarChart data={sacData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <XAxis dataKey="bits" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: 'hsl(var(--popover-foreground))' }} />
                  <Bar dataKey="count" name="出现次数" radius={[3, 3, 0, 0]}>
                    {sacData.map((d) => (
                      <Cell key={d.bits} fill={d.bits === 8 ? '#e11d48' : '#fb7185'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3 font-mono text-sm">
              <span className="text-muted-foreground">平均变化比特数</span>
              <span
                className={
                  Math.abs(mean - 8) < 0.5
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }
              >
                {mean.toFixed(2)} / 16 {Math.abs(mean - 8) < 0.5 ? '✓ 接近 50%' : '✗ 偏离 50%'}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              还有比特独立条件：翻转输入比特 i 时，输出比特 j 与 k 应当独立变化——
              正是这个要求逼出了后面线性/差分分析要钻的空子。
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
