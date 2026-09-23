import { useMemo, useState } from 'react'
import { Cake, Dices, Hash } from 'lucide-react'
import {
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Section } from '../shared'
import { birthdayExact, collisionTrial } from '@/lib/machash'
import { cn } from '@/lib/utils'

const TOOLTIP_STYLE = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 8,
  fontSize: 12,
  color: 'hsl(var(--popover-foreground))',
}

const hashTable = [
  { name: 'MD5', bits: 128, generic: '2⁶⁴', broken: '2²⁰·⁹⁶', brokenNote: '已被实际破解' },
  { name: 'SHA-1', bits: 160, generic: '2⁸⁰', broken: '2⁵¹', brokenNote: '已被实际破解' },
  { name: 'SHA-256', bits: 256, generic: '2¹²⁸', broken: '—', brokenNote: '至今安全' },
]

export default function MhBirthday() {
  const [bits, setBits] = useState(16)
  const [trials, setTrials] = useState<number[]>([])
  const [batchSeed, setBatchSeed] = useState(1)

  // 生日曲线（365 天版本）
  const curve = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        n: i + 1,
        p: +(birthdayExact(i + 1) * 100).toFixed(1),
      })),
    []
  )

  const runTrials = () => {
    const out: number[] = []
    for (let i = 0; i < 200; i++) out.push(collisionTrial(bits, batchSeed * 1000 + i))
    setTrials(out)
    setBatchSeed((s) => s + 1)
  }

  const avg = trials.length ? trials.reduce((a, b) => a + b, 0) / trials.length : 0
  const theory = Math.sqrt(Math.PI / 2) * 2 ** (bits / 2)

  return (
    <Section
      id="mh-birthday"
      index="03 · 抗碰撞哈希"
      title="生日悖论：碰撞比你想的容易得多"
      subtitle="多少人聚在一起，就有超过一半的概率两人同生日？直觉说 183，答案是 23。对哈希函数同理：ℓ 位输出的碰撞不需要 2^ℓ 次尝试，√2^ℓ = 2^(ℓ/2) 次就够——输出长度是抗碰撞性的生命线。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Cake className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              生日曲线与蒙特卡洛碰撞实验
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-48 w-full">
              <ResponsiveContainer>
                <LineChart data={curve} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <XAxis dataKey="n" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} unit="%" domain={[0, 100]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: 'hsl(var(--popover-foreground))' }} />
                  <Line
                    type="monotone"
                    dataKey="p"
                    name="至少一对同生日的概率"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dot={false}
                  />
                  <ReferenceDot x={23} y={50.7} r={5} fill="#e11d48" stroke="none" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground">
              红点：n = 23 时概率已达 50.7%——「生日悖论」的悖，在于人们误把
              「和我同生日」当成了「任意两人同生日」，前者要 253 人，后者只要 23 人。
            </p>

            <div className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs text-muted-foreground">
                  玩具哈希输出 {bits} 比特（空间 2^{bits}）
                </label>
                <Button variant="outline" className="border-border h-7 text-xs" onClick={runTrials}>
                  <Dices className="mr-1 h-3 w-3" /> 跑 200 次找碰撞
                </Button>
              </div>
              <Slider value={[bits]} min={8} max={24} step={2} onValueChange={([v]) => { setBits(v); setTrials([]) }} />
              {trials.length > 0 && (
                <div className="mt-2 font-mono text-xs text-muted-foreground">
                  平均 <span className="text-foreground">{avg.toFixed(0)}</span> 次找到碰撞 ·
                  理论 √(π/2)·2^{bits / 2} ≈{' '}
                  <span className="text-teal-700 dark:text-teal-300">{theory.toFixed(0)}</span> ·
                  远小于穷举 2^{bits} = {(2 ** bits).toLocaleString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Hash className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                真实哈希函数的碰撞复杂度
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2">函数</th>
                    <th className="pb-2">输出</th>
                    <th className="pb-2">生日上界</th>
                    <th className="pb-2">实际攻击</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {hashTable.map((h) => (
                    <tr key={h.name} className="border-b border-border/50">
                      <td className="py-2 text-foreground">{h.name}</td>
                      <td className="py-2 text-muted-foreground">{h.bits} 位</td>
                      <td className="py-2 text-muted-foreground">{h.generic}</td>
                      <td
                        className={cn(
                          'py-2',
                          h.broken === '—'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {h.broken} {h.brokenNote}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs leading-relaxed text-muted-foreground">
                生日上界只是「蛮力基准线」；MD5 和 SHA-1 的实际碰撞攻击远低于上界——
                结构被密码分析拆穿了。两者均已退役。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">三个安全级别，逐级减弱</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="text-foreground">抗碰撞</span>：找不到任意一对 x≠x′ 使
                  H(x)=H(x′)。最强。
                </li>
                <li>
                  <span className="text-foreground">抗二次原像</span>：给定 x，找不到另一个
                  x′ 撞它。
                </li>
                <li>
                  <span className="text-foreground">抗原像</span>：给定 y=H(x)，反推不出任何原像。最弱。
                </li>
              </ul>
              <p className="text-xs">
                攻击越难 ⇒ 能防住它的安全性越弱。生日攻击专打最强的抗碰撞；
                后两者没有生日捷径，仍是 2^ℓ 量级。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">Merkle-Damgård 变换</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>
                定长压缩函数 h（2ℓ→ℓ 比特）迭代成变长哈希：
                zᵢ = h(zᵢ₋₁ ‖ xᵢ)，<span className="text-foreground">最后必须追加长度块</span>
                ——否则不同消息的填充后输入可能完全相同。
              </p>
              <p className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
                定理：h 抗碰撞 ⇒ H 抗碰撞。（H 的碰撞必在某一跳暴露出 h 的碰撞）
              </p>
              <p className="text-xs">
                压缩函数本身可用块密码构造：Davies-Meyer（SHA-1/2、MD5）
                hᵢ = F_(mᵢ)(hᵢ₋₁) ⊕ hᵢ₋₁；若少了末尾的异或，敌手可以对 F 求逆自由操纵链接值。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
