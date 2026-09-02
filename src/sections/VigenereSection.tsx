import { useMemo, useState } from 'react'
import { KeyRound, Repeat2, Waves, Unlock } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  crackVigenere,
  icByPeriod,
  kasiski,
  sanitize,
  vigenereEncrypt,
  IC_ENGLISH,
  IC_RANDOM,
  ALPHABET,
} from '@/lib/ciphers'
import { CipherText, Formula, Section } from './shared'
import { cn } from '@/lib/utils'

const DEFAULT_PLAIN = `thevigenerecipherisamethodofencryptingalphabetictextbyusingaseriesof
interwovenCaesarciphersbasedonthelettersofakeworditemploysaformofpolyalphabeticsubstitution
althoughthecipheriseasytounderstandandimplementforthreedecadesitresistedallattemptstobreakit
andthisearneditthedescriptionoftheindecipherablecipherbabbageisthekintohavebrokentheciph`

const DEFAULT_KEY = 'crypto'

// 密钥周期着色
const COLORS = [
  'text-amber-700 dark:text-amber-300',
  'text-sky-700 dark:text-sky-300',
  'text-emerald-700 dark:text-emerald-300',
  'text-rose-700 dark:text-rose-300',
  'text-violet-700 dark:text-violet-300',
  'text-orange-700 dark:text-orange-300',
]

export default function VigenereSection() {
  const [plain, setPlain] = useState(DEFAULT_PLAIN)
  const [keyInput, setKeyInput] = useState(DEFAULT_KEY)
  const key = sanitize(keyInput) || DEFAULT_KEY
  const clean = useMemo(() => sanitize(plain), [plain])
  const cipher = useMemo(() => vigenereEncrypt(clean, key), [clean, key])

  const t = key.length
  const repeats = useMemo(() => kasiski(cipher), [cipher])
  const allDistances = useMemo(() => repeats.flatMap((r) => r.distances), [repeats])
  // Kasiski 推断周期：对间距做「因子投票」，能整除最多间距的候选周期最可能是 t
  const kasiskiGuess = useMemo(() => {
    if (!allDistances.length) return 0
    let best = 0
    let bestVotes = -1
    for (let tau = 2; tau <= 16; tau++) {
      const votes = allDistances.filter((d) => d % tau === 0).length
      if (votes > bestVotes) {
        bestVotes = votes
        best = tau
      }
    }
    return best
  }, [allDistances])

  const icData = useMemo(
    () => icByPeriod(cipher, 16).map(({ tau, ic }) => ({ tau, ic: +ic.toFixed(4) })),
    [cipher]
  )
  const guessedPeriod = useMemo(() => {
    const sorted = [...icData].sort((a, b) => b.ic - a.ic)
    return sorted.find((d) => d.ic > 0.055)?.tau ?? sorted[0].tau
  }, [icData])

  const crack = useMemo(() => crackVigenere(cipher, guessedPeriod), [cipher, guessedPeriod])

  return (
    <Section
      id="vigenere"
      index="04 · 加密 + 破解"
      title="维吉尼亚密码 Vigenère Cipher"
      subtitle="多表移位：用一个关键词作为密钥，让明文中相同字母的不同出现映射为不同的密文字母，从而抹平统计分布。它曾两百多年未被有效破解——直到 Kasiski 方法与重合指数出现。"
    >
      {/* 加密 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <KeyRound className="h-5 w-5 text-amber-600 dark:text-amber-400" /> 动手加密
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>cᵢ = mᵢ + k_[i mod t] ，t 是密钥长度（周期）</Formula>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  关键词密钥（周期 t = {t}）
                </label>
                <Input
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="border-input bg-background font-mono text-amber-700 dark:text-amber-300"
                />
              </div>
              <div className="flex items-end pb-1">
                <div className="flex gap-1">
                  {key.split('').map((ch, i) => (
                    <span
                      key={i}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded bg-secondary font-mono text-lg',
                        COLORS[i % COLORS.length]
                      )}
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">明文</label>
              <Textarea
                value={plain}
                onChange={(e) => setPlain(e.target.value)}
                rows={4}
                className="border-input bg-background font-mono text-sm text-foreground"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                密文（颜色标记每个字母由密钥的哪一位加密）
              </label>
              <CipherText
                text={cipher}
                className="max-h-40 overflow-y-auto"
                highlight={(_, i) => COLORS[i % t % COLORS.length]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Kasiski */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Repeat2 className="h-5 w-5 text-red-600 dark:text-red-400" />{' '}
              破解第一步：Kasiski 方法找周期 t
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              相同明文片段被相同密钥片段加密，会产生
              <span className="text-foreground">重复的密文片段</span>
              。重复出现之间的距离应当是周期 t 的倍数——取所有距离的
              <span className="text-foreground">最大公约数</span>即为 t。
            </p>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">重复片段</th>
                    <th className="px-3 py-2 text-left">出现位置</th>
                    <th className="px-3 py-2 text-left">间距</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {repeats.slice(0, 8).map((r) => (
                    <tr key={r.pattern} className="border-t border-border/60">
                      <td className="px-3 py-1.5 text-amber-700 dark:text-amber-300">
                        {r.pattern}
                      </td>
                      <td className="px-3 py-1.5 text-muted-foreground">
                        {r.positions.join(', ')}
                      </td>
                      <td className="px-3 py-1.5 text-foreground">{r.distances.join(', ')}</td>
                    </tr>
                  ))}
                  {repeats.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-3 py-3 text-muted-foreground">
                        密文太短，没有找到重复片段
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {kasiskiGuess > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 font-mono text-sm text-foreground">
                间距 = {allDistances.slice(0, 10).join(', ')}
                {allDistances.length > 10 ? ', …' : ''}
                <br />
                能整除最多间距的候选周期：
                <span className="text-amber-700 dark:text-amber-300"> t = {kasiskiGuess}</span>（
                {allDistances.filter((d) => d % kasiskiGuess === 0).length}/{allDistances.length}{' '}
                个间距是它的倍数）
                {kasiskiGuess === t ? (
                  <span className="ml-2 text-emerald-600 dark:text-emerald-400">
                    ✓ 正是真实周期 t = {t}
                  </span>
                ) : (
                  <span className="ml-2 text-muted-foreground">
                    （真实 t = {t}，重复也可能是巧合）
                  </span>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              课堂方法：假设密钥中没有重复模式，则间距应都是 t 的倍数，取最大公约数即为 t。
              但重复也可能是巧合（个别间距并非 t 的倍数会使 gcd 失效），所以实践中统计
              「哪个候选周期能整除最多间距」更稳健——也可以直接用下面的重合指数法。
            </p>
          </CardContent>
        </Card>
      </div>

      {/* IC 找周期 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Waves className="h-5 w-5 text-red-600 dark:text-red-400" />{' '}
              破解第二步：重合指数确定周期
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              对每个候选周期 τ，取间隔为 τ 的字符集合 c₁, c₁₊τ, c₁₊₂τ… 计算重合指数。 若 τ =
              t，同一列的密文都是同一个移位密钥加密的，分布与明文一致，
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                {' '}
                I(τ) ≈ 0.065
              </span>
              ；否则各列混杂趋于均匀，
              <span className="font-mono text-foreground"> I(τ) ≈ 0.038</span>。
            </p>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <BarChart data={icData} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
                  <XAxis dataKey="tau" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} domain={[0, 0.09]} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                      color: 'hsl(var(--popover-foreground))',
                    }}
                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <ReferenceLine y={IC_ENGLISH} stroke="#10b981" strokeDasharray="4 4" />
                  <ReferenceLine y={IC_RANDOM} stroke="#71717a" strokeDasharray="4 4" />
                  <Bar dataKey="ic" radius={[3, 3, 0, 0]}>
                    {icData.map((d) => (
                      <Cell key={d.tau} fill={d.tau % t === 0 ? '#f59e0b' : '#a1a1aa'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground">
              高亮的柱子是真实周期 t = {t} 的倍数；自动判定的周期：
              <span className="font-mono text-amber-700 dark:text-amber-300">
                {' '}
                t = {guessedPeriod}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* 逐列破解 */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Unlock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />{' '}
              破解第三步：逐列用重合指数猜密钥
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              周期确定后，密钥中每个字母都只是某列密文的移位密钥——
              对每一列分别用移位密码的重合指数攻击，逐个字母猜出密钥：
            </p>
            <div className="flex flex-wrap gap-2">
              {crack.columnKeys.map((kk, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex flex-col items-center rounded-lg border px-3 py-2',
                    ALPHABET[kk] === key[i]
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-border bg-card'
                  )}
                >
                  <span className="text-[10px] text-muted-foreground">第 {i + 1} 列</span>
                  <span
                    className={cn(
                      'font-mono text-xl',
                      ALPHABET[kk] === key[i]
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-amber-700 dark:text-amber-300'
                    )}
                  >
                    {ALPHABET[kk]}
                  </span>
                  <span className="text-[10px] text-muted-foreground">k={kk}</span>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <div className="mb-2 font-mono text-sm text-foreground">
                破解出密钥：
                <span className="text-emerald-700 dark:text-emerald-300">{crack.key}</span>
                {crack.key === key ? (
                  <Badge className="ml-2 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    ✓ 完全命中
                  </Badge>
                ) : (
                  <span className="ml-2 text-muted-foreground">
                    （真实密钥 {key}，文本越短越可能偏差）
                  </span>
                )}
              </div>
              <CipherText
                text={crack.plaintext.slice(0, 260) + (crack.plaintext.length > 260 ? '…' : '')}
                className="text-sm text-emerald-800/80 dark:text-emerald-200/80"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
