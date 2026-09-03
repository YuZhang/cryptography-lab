import { useMemo, useState } from 'react'
import { TrendingDown } from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Formula, Section } from '../shared'

export default function CsNegligible() {
  const [k, setK] = useState(2) // 多项式 p(n) = n^k

  const chartData = useMemo(() => {
    const data = []
    for (let n = 1; n <= 64; n++) {
      data.push({
        n,
        '2^-n（可忽略）': Math.pow(2, -n),
        [`1/n^${k}（不可忽略）`]: Math.pow(n, -k),
      })
    }
    return data
  }, [k])

  // 找交叉点 N：n > N 时 2^-n < 1/n^k
  const crossover = useMemo(() => {
    for (let n = 1; n <= 512; n++) {
      if (Math.pow(2, -n) < Math.pow(n, -k)) return n
    }
    return null
  }, [k])

  return (
    <Section
      id="cs-relax"
      index="01 · 计算安全"
      title="两个放松：可行时间 + 可忽略概率"
      subtitle="Kerckhoffs 的另一条原则：一个加密方案如果不是数学上不可破解，那必须是实践上不可破解。具体法（t, ε）是一个「点」，渐进法是一条「线」——研究安全性随安全参数 n 变化的规律。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="text-foreground">什么是「可忽略」？</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <Formula>∀多项式 p(·)，∃N：n &gt; N 时 f(n) &lt; 1/p(n)</Formula>
            <p>
              可忽略函数要<span className="text-foreground">比所有多项式的倒数都小</span>。
              1/n² 不行——它被 1/n³ 挑战失败；指数衰减 2⁻ⁿ 可以——无论多项式长多快，
              最终都被指数甩在身后。
            </p>
            <p>
              于是安全定义水到渠成：对任意概率多项式时间（PPT）敌手，存在一个可忽略函数
              negl(n)，使得其在不可区分实验中的成功概率
            </p>
            <Formula>Pr[成功] ≤ 1/2 + negl(n)</Formula>
            <p>
              「可行的时间」= 多项式时间。这来自计算复杂性理论的信念：P ≠ NP。
              纳什 1955 年致信 NSA 时便猜测破译需要密钥长度指数级的时间；
              电视剧《天才基本法》里甚至有一个 P=NP 被证明的平行世界——在那里，一切密码轰然倒塌。
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingDown className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              动手看：指数 vs 多项式倒数（对数坐标）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>挑战多项式 p(n) = nᵏ</span>
                <span className="font-mono text-foreground">k = {k}</span>
              </div>
              <Slider value={[k]} onValueChange={([v]) => setK(v)} min={1} max={6} step={1} />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#71717a33" />
                  <XAxis dataKey="n" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis
                    scale="log"
                    domain={[1e-18, 1]}
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    tickFormatter={(v: number) => `1e${Math.round(Math.log10(v))}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                      color: 'hsl(var(--popover-foreground))',
                    }}
                    formatter={(v: number) => v.toExponential(1)}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="2^-n（可忽略）"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey={`1/n^${k}（不可忽略）`}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-3 font-mono text-sm text-foreground">
              {crossover !== null && (
                <>
                  当 n &gt; <span className="text-sky-600 dark:text-sky-400">{crossover}</span> 时，
                  2⁻ⁿ 已小于 1/n^{k}——k 再大也只会推迟这一刻，无法阻止它到来。
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              注意：安全是对「足够大的 n」而言的——这就是为什么密钥要足够长。
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
