import { useMemo, useState } from 'react'
import { Grid3X3, Infinity as InfinityIcon, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Formula, Section } from '../shared'
import { sufKeyCandidates, sufMac } from '@/lib/machash'
import { cn } from '@/lib/utils'

const PRIMES = [17, 31, 61, 101]

export default function MhSuf() {
  const [p, setP] = useState(31)
  const [key, setKey] = useState<[number, number]>([7, 12])
  const [mQuery, setMQuery] = useState('5')
  const [tQuery, setTQuery] = useState<number | null>(null)
  const [mForge, setMForge] = useState('9')
  const [tForge, setTForge] = useState('')
  const [verdict, setVerdict] = useState<boolean | null>(null)
  const [rounds, setRounds] = useState(0)
  const [wins, setWins] = useState(0)

  const newGame = (pp: number) => {
    setKey([Math.floor(Math.random() * pp), Math.floor(Math.random() * pp)])
    setTQuery(null)
    setVerdict(null)
  }

  const mq = parseInt(mQuery)
  const mf = parseInt(mForge)
  const validMsg = !isNaN(mq) && mq >= 0 && mq < p && !isNaN(mf) && mf >= 0 && mf < p && mq !== mf

  const candidates = useMemo(
    () => (tQuery !== null ? sufKeyCandidates(mq % p, tQuery, p) : []),
    [tQuery, mq, p]
  )

  const doQuery = () => {
    if (isNaN(mq)) return
    setTQuery(sufMac(key[0], key[1], mq % p, p))
    setVerdict(null)
  }

  const doForge = () => {
    const t = parseInt(tForge)
    if (isNaN(t) || !validMsg) return
    const ok = t % p === sufMac(key[0], key[1], mf % p, p)
    setVerdict(ok)
    setRounds((r) => r + 1)
    if (ok) setWins((w) => w + 1)
  }

  // 每个候选密钥对新消息的预测——互不相同，恰有一个正确
  const predictions = useMemo(() => {
    if (candidates.length === 0 || isNaN(mf)) return []
    return candidates.map(([a, b]) => ({ a, b, t: sufMac(a, b, mf % p, p) }))
  }, [candidates, mf, p])

  return (
    <Section
      id="mh-suf"
      index="05 · 信息论 MAC"
      title="不假设任何困难问题：强全域函数"
      subtitle="算力无限的敌手至少能以 1/2^|t| 蒙中标签——所以「完美 MAC」只能限查询次数来定义。一次 ε-安全 MAC 用代数直线实现：h_{a,b}(m) = a·m + b mod p。一次查询只看到一条直线上的一个点，p 条候选密钥线上各猜各的。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Grid3X3 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              一次伪造游戏（SUF：a·m + b mod p）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>Pr[h_k(m)=t ∧ h_k(m′)=t′] = 1/|T|²</Formula>
            <div className="flex items-center gap-3">
              <label className="text-xs text-muted-foreground">素数 p = {p}</label>
              <Slider
                value={[PRIMES.indexOf(p)]}
                min={0}
                max={PRIMES.length - 1}
                step={1}
                className="w-40"
                onValueChange={([i]) => {
                  setP(PRIMES[i])
                  newGame(PRIMES[i])
                }}
              />
              <Button variant="outline" className="border-border h-7 text-xs" onClick={() => newGame(p)}>
                换密钥
              </Button>
            </div>

            <div className="flex items-end gap-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">查询消息 m′（0–{p - 1}）</label>
                <Input value={mQuery} onChange={(e) => setMQuery(e.target.value)} className="w-20 border-input bg-background font-mono text-foreground" />
              </div>
              <Button variant="outline" className="border-border" onClick={doQuery} disabled={isNaN(mq)}>
                1 · 查询标签
              </Button>
            </div>
            {tQuery !== null && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-muted-foreground">
                t′ = a·{mq % p} + b ≡ <span className="text-teal-700 dark:text-teal-300">{tQuery}</span> (mod {p})
                —— 与这次观察一致的密钥 (a,b) 有 <span className="text-foreground">{candidates.length}</span> 个
              </div>
            )}

            {tQuery !== null && (
              <>
                <div className="flex items-end gap-2">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">新消息 m ≠ m′</label>
                    <Input value={mForge} onChange={(e) => setMForge(e.target.value)} className="w-20 border-input bg-background font-mono text-foreground" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">伪造标签 t</label>
                    <Input value={tForge} onChange={(e) => setTForge(e.target.value)} className="w-20 border-input bg-background font-mono text-foreground" />
                  </div>
                  <Button onClick={doForge} disabled={!validMsg} className="bg-teal-600 text-white hover:bg-teal-700">
                    2 · 提交伪造
                  </Button>
                </div>
                {!validMsg && (
                  <p className="text-xs text-red-600 dark:text-red-400">m′ 与 m 必须是 0–{p - 1} 之间不同的整数</p>
                )}
                {verdict !== null && (
                  <div
                    className={cn(
                      'rounded-lg border p-3 text-sm',
                      verdict
                        ? 'border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300'
                        : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                    )}
                  >
                    {verdict ? '✗ 蒙对了（运气）' : '✓ 伪造失败'}——
                    {p} 个候选密钥对新消息的预测各不相同，盲猜命中率恰为 1/{p}
                  </div>
                )}
                <div className="font-mono text-sm text-muted-foreground">
                  战绩 {wins}/{rounds}
                  {rounds >= 8 && ` · 命中率 ${((wins / rounds) * 100).toFixed(0)}% ≈ 1/${p} = ${(100 / p).toFixed(1)}%`}
                </div>
                {predictions.length > 0 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">
                      查看候选密钥的预测表（前 8 条，共 {predictions.length} 条）
                    </summary>
                    <div className="mt-1 grid grid-cols-2 gap-1 font-mono sm:grid-cols-4">
                      {predictions.slice(0, 8).map((pr, i) => (
                        <span key={i} className="rounded border border-border bg-muted/40 px-1.5 py-0.5 text-muted-foreground">
                          ({pr.a},{pr.b})→{pr.t}
                        </span>
                      ))}
                    </div>
                  </details>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <KeyRound className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                为什么恰好是 1/p？
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                两条观察 (m,t)、(m′,t′) 确定<span className="text-foreground">唯一</span>密钥：
                a = (t−t′)·(m−m′)⁻¹ mod p，b = t − a·m。
                所以一次查询后，|K(t′)| = p 个密钥等可能；它们对新消息的预测两两不同，
                恰有一个等于真实标签。
              </p>
              <p className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
                定理：h 是 SUF ⇒ Mac_k(m)=h_k(m) 是一次 1/|T|-安全 MAC。
              </p>
              <p className="text-xs">
                直觉判据：K(t′) 太小 ⇒ 敌手锁定密钥，必破；太大 ⇒ 候选密钥虽多，
                但「令 (m,t) 有效的密钥集合」也同比例变大，照样危险——成对独立才是甜点。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <InfinityIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                代价：密钥按查询次数膨胀
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                ℓ 次查询仍保持 2⁻ⁿ 安全 ⟹ 密钥长度至少
                <span className="text-foreground"> (ℓ+1)·n 比特</span>。
                每对消息-标签要「消耗」n 比特密钥熵来支撑 2⁻ⁿ 的不可伪造性。
              </p>
              <p className="text-xs">
                证明思路：敌手遍历所有 t′ 计算 K(t′)，成功概率 Σ Pr[t′]·1/|K(t′)| ≥ 2ⁿ/|K|；
                要它 ≤ 2⁻ⁿ 就得 |K| ≥ 2²ⁿ——一次安全就要 2n 比特密钥。
                这正是实践中转向计算安全 MAC（PRF/HMAC）的原因：
                短密钥 + 困难假设，换来无限次查询。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
