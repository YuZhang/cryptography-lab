import { useMemo, useState } from 'react'
import { Bomb, ScanSearch } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  ALPHABET,
  bruteForceShift,
  crackShiftByIC,
  IC_ENGLISH,
  IC_RANDOM,
  sanitize,
  shiftEncrypt,
} from '@/lib/ciphers'
import { CipherText, Formula, Section } from './shared'
import { cn } from '@/lib/utils'

export default function ShiftSection() {
  const [plain, setPlain] = useState('begintheattacknow')
  const [k, setK] = useState(7)
  const clean = useMemo(() => sanitize(plain), [plain])
  const cipher = useMemo(() => shiftEncrypt(clean, k), [clean, k])

  const candidates = useMemo(() => bruteForceShift(cipher), [cipher])
  const attack = useMemo(() => crackShiftByIC(cipher), [cipher])
  const chartData = attack.scores.map(({ s, score }) => ({ s, score: +(score * 100).toFixed(2) }))

  return (
    <Section
      id="shift"
      index="02 · 加密 + 破解"
      title="移位密码 Shift Cipher"
      subtitle="把凯撒的固定 3 位推广为密钥 k。密钥空间从 1 变成了 26——这在穷举攻击面前依然不堪一击，由此引出「充足密钥空间原则」。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 加密 */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="text-foreground">动手加密</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Formula>Encₖ(m) = m + k (mod 26)</Formula>
              <br />
              <Formula>Decₖ(c) = c − k (mod 26)</Formula>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">明文 m</label>
              <Input
                value={plain}
                onChange={(e) => setPlain(e.target.value)}
                className="border-input bg-background font-mono text-foreground"
              />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>密钥 k</span>
                <span className="font-mono text-amber-700 dark:text-amber-300">
                  k = {k}（a → {ALPHABET[k]}）
                </span>
              </div>
              <Slider value={[k]} onValueChange={([v]) => setK(v)} min={1} max={25} step={1} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">密文 c</label>
              <CipherText
                text={cipher || '…'}
                className="text-amber-700 dark:text-amber-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* 穷举攻击 */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Bomb className="h-5 w-5 text-red-600 dark:text-red-400" /> 破解一：穷举攻击
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              密钥空间只有 26，Eve 把每个候选密钥都试一遍，找出读得通的那个：
            </p>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
              <table className="w-full font-mono text-sm">
                <tbody>
                  {candidates.map(({ k: kk, text }) => (
                    <tr
                      key={kk}
                      className={cn(
                        'border-b border-border/60',
                        kk === k
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'text-muted-foreground'
                      )}
                    >
                      <td className="w-14 px-3 py-1.5">k={kk}</td>
                      <td className="px-3 py-1.5">{text || '…'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-foreground">
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                充足密钥空间原则
              </span>
              ：任何安全加密方案必须具有一个经受得住穷举搜索的密钥空间。
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 重合指数攻击 */}
      <Card className="mt-6 border-border bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ScanSearch className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            破解二：重合指数自动定位密钥
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 text-sm leading-relaxed text-muted-foreground lg:grid-cols-2">
            <p>
              穷举时要「人眼」判断哪个明文是英文，能否自动化？ 定义
              <span className="text-foreground">重合指数</span> I = Σpᵢ²
              ——随机挑两个字母相同的概率。英文文本 I ≈
              <span className="font-mono text-emerald-600 dark:text-emerald-400"> 0.065</span>
              ，而均匀随机文本只有
              <span className="font-mono text-foreground"> 1/26 ≈ 0.038</span>。
            </p>
            <p>
              对每个候选移位 s 计算 I(s) = Σ pᵢ·qᵢ₊ₛ（p 是英文频率，q
              是密文频率）。当 s 恰好等于密钥 k 时，密文中 D 的概率正是明文中 a 的概率……对应频率两两吻合，
              <span className="text-foreground">I(s) 达到最大</span>——密钥自动浮出水面。
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <XAxis dataKey="s" tick={{ fill: '#71717a', fontSize: 11 }} interval={1} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} domain={[0, 8]} />
                <ReferenceLine
                  y={IC_ENGLISH * 100}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: '英文 0.065', fill: '#10b981', fontSize: 11, position: 'top' }}
                />
                <ReferenceLine y={IC_RANDOM * 100} stroke="#71717a" strokeDasharray="4 4" />
                <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.s} fill={d.s === attack.k ? '#f59e0b' : '#a1a1aa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="font-mono text-sm text-foreground">
              I(s) 最大值出现在{' '}
              <span className="text-amber-700 dark:text-amber-300">s = {attack.k}</span> ⇒
              破解出密钥
              <span className="text-amber-700 dark:text-amber-300"> k = {attack.k}</span>
              {attack.k === k ? (
                <span className="ml-2 text-emerald-600 dark:text-emerald-400">
                  ✓ 与真实密钥一致
                </span>
              ) : (
                <span className="ml-2 text-muted-foreground">
                  （文本太短可能有偏差，真实 k = {k}）
                </span>
              )}
            </div>
            <CipherText
              text={attack.plaintext || '…'}
              className="w-full text-emerald-700 dark:text-emerald-300"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            这不正是「大数据（足够的英文文本统计）+ 人工智能（判断是否是英文）」吗？
          </p>
        </CardContent>
      </Card>
    </Section>
  )
}
