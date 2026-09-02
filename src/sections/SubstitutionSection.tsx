import { useMemo, useState } from 'react'
import { Dices, BarChart3 } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  ALPHABET,
  ENGLISH_FREQ,
  letterCounts,
  randomSubstitutionKey,
  substEncrypt,
} from '@/lib/ciphers'
import { AlphabetMap, CipherText, Section } from './shared'

const DEFAULT_PLAIN = `thegoldbugisashortstorybyedgarallanpoeinwhichwilliamlegrand
becomesobsessedwithsearchingforlosttreasureafterbeingbittenbyagoldcoloredbug
hisfriendjupiterfearsheisgoinginsaneandgoestolegrandsfriendforthehelptosolvethecipher
thecryptogramisdecipheredbyfrequencyanalysisandthetreasureisfound`

export default function SubstitutionSection() {
  const [key, setKey] = useState('xeuadnbkvmrocqfsyhwglzijpt')
  const [plain, setPlain] = useState(DEFAULT_PLAIN)
  const cipher = useMemo(() => substEncrypt(plain, key), [plain, key])

  // 按英文频率从高到低排列明文身份，对比其密文像的频率
  const freqData = useMemo(() => {
    const cipherCounts = letterCounts(cipher)
    return ALPHABET.split('')
      .map((letter, i) => ({ letter, eng: ENGLISH_FREQ[i], i }))
      .sort((a, b) => b.eng - a.eng)
      .slice(0, 12)
      .map(({ letter, eng, i }) => ({
        name: `${letter}→${key[i] ?? '?'}`,
        英文频率: +eng.toFixed(1),
        密文频率: +cipherCounts[ALPHABET.indexOf(key[i] ?? 'a')].pct.toFixed(1),
      }))
  }, [cipher, key])

  const topCipherLetters = useMemo(
    () =>
      [...letterCounts(cipher)]
        .sort((a, b) => b.pct - a.pct)
        .filter((l) => l.count > 0)
        .slice(0, 5),
    [cipher]
  )

  return (
    <Section
      id="substitution"
      index="03 · 加密 + 破解"
      title="单表替换密码 Mono-Alphabetic Substitution"
      subtitle="每个字母以任意方式映射到另一个不同字母。密钥是 26 个字母的一个排列：密钥空间高达 26! ≈ 2⁸⁸，穷举彻底失效——但它仍然被另一种武器击穿：统计。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="text-foreground">动手加密</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                替换密钥（上行明文 → 下行密文）
              </span>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-500/40 text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
                onClick={() => setKey(randomSubstitutionKey())}
              >
                <Dices className="mr-1 h-4 w-4" /> 随机换一个密钥
              </Button>
            </div>
            <AlphabetMap top={ALPHABET} bottom={key} />
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                明文（默认是一段足够长的英文，供频率分析）
              </label>
              <Textarea
                value={plain}
                onChange={(e) => setPlain(e.target.value)}
                rows={4}
                className="border-input bg-background font-mono text-sm text-foreground"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">密文</label>
              <CipherText
                text={cipher.slice(0, 220) + (cipher.length > 220 ? '…' : '')}
                className="text-amber-700 dark:text-amber-300"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              密钥空间 = 26! ≈ 4.03 × 10²⁶ ≈ 2⁸⁸ · 每秒试 10 亿个密钥也要 10¹⁰ 年——穷举不可行。
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5 text-red-600 dark:text-red-400" /> 破解：字母频率分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>统计密文中每个字母的频率并制表；</li>
              <li>与英文文本的字母频率比较；</li>
              <li>猜测频率最高的密文字母对应 e，如此猜测其它字母；</li>
              <li>挑选「合理的」明文——需要试错，但并不算难。</li>
            </ol>

            <div className="rounded-lg border border-border bg-muted/60 p-3 text-sm">
              <span className="text-muted-foreground">本密文最高频字母：</span>
              {topCipherLetters.map((l, i) => (
                <span key={l.letter} className="ml-2 font-mono">
                  <span className="text-amber-700 dark:text-amber-300">{l.letter}</span>
                  <span className="text-muted-foreground">({l.pct.toFixed(1)}%)</span>
                  {i === 0 && (
                    <span className="ml-1 text-emerald-600 dark:text-emerald-400">
                      ⇐ 很可能就是 e
                    </span>
                  )}
                </span>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              下图把英文中最常见的 12 个字母（e、t、a…）与它们各自的
              <span className="text-foreground">密文像</span>
              的频率放在一起——分布形状几乎原封不动，只是换了标签：
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={freqData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                      color: 'hsl(var(--popover-foreground))',
                    }}
                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    labelStyle={{ color: '#d97706' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="英文频率" fill="#a1a1aa" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="密文频率" radius={[3, 3, 0, 0]}>
                    {freqData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#f59e0b' : '#b45309'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-sm text-foreground">
              <span className="font-semibold text-amber-600 dark:text-amber-400">教训</span>
              ：单表替换改变了字母的「名字」，却没有改变字母的「性格」（频率）。爱伦·坡的小说《金甲虫》中，主人公正是用频率分析破解了海盗的藏宝密码。
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
