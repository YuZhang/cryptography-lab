import { useState } from 'react'
import { DoorClosed, FlaskConical, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Formula, Section } from '../shared'
import { multChallenge, type MultChallenge } from '@/lib/owf'
import { cn } from '@/lib/utils'

const candidates = [
  { name: '乘法 → 分解', f: 'f(x, y) = (x·y, |x|, |y|)', note: 'x, y 为等长素数。后面 RSA 的地基。' },
  { name: '模平方 → 开根', f: 'f(x) = x² mod N', note: '也用于公钥密码学。' },
  { name: '离散指数 → 对数', f: 'f(x) = gˣ mod p', note: 'DH 密钥交换的地基。' },
  { name: '子集和', f: 'f(x₁…xₙ, J) = (x₁…xₙ, Σⱼ∈J xⱼ)', note: '给和找子集，NP 完全问题。' },
]

export default function TcOwf() {
  const [bits, setBits] = useState(6)
  const [ch, setCh] = useState<MultChallenge | null>(null)
  const [guess, setGuess] = useState('')
  const [tries, setTries] = useState(0)
  const [solved, setSolved] = useState(false)
  const [startedAt, setStartedAt] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  const newChallenge = () => {
    setCh(multChallenge(bits))
    setGuess('')
    setTries(0)
    setSolved(false)
    setStartedAt(Date.now())
  }

  const submit = () => {
    if (!ch || solved) return
    const v = parseInt(guess)
    if (isNaN(v)) return
    setTries((t) => t + 1)
    if (v > 1 && ch.n % v === 0 && v !== ch.n) {
      setSolved(true)
      setElapsed(Date.now() - startedAt)
    }
  }

  // 成本对比：正向乘法 ≈ 常数，蛮力分解 ≈ √N = 2^bits 次试除
  const forwardOps = bits * bits // 粗略：位运算量级
  const invertOps = 2 ** bits

  return (
    <Section
      id="tc-owf"
      index="01 · 单向函数"
      title="求逆实验：你来当敌手"
      subtitle="单向函数 = 正向多项式时间可算，逆向任意多项式时间敌手的成功概率都可忽略。别只看定义——亲手试试分解一个合数，再把比特数拖大，体会「指数鸿沟」。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FlaskConical className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
              Invert 实验台：乘法 → 分解
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>Invert：随机 x ← y=f(x) → A(y)=x′ · 成功 ⟺ f(x′)=y</Formula>
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                素数比特数 = {bits}（N ≈ {bits * 2} 比特）
              </label>
              <Slider value={[bits]} min={4} max={16} step={1} onValueChange={([v]) => setBits(v)} />
            </div>
            <Button onClick={newChallenge} className="bg-fuchsia-600 text-white hover:bg-fuchsia-700">
              生成挑战 N = p·q
            </Button>

            {ch && (
              <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
                <div className="font-mono text-lg text-foreground">
                  N = <span className="text-fuchsia-600 dark:text-fuchsia-400">{ch.n}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    （两个 {bits} 比特素数之积）
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="猜一个因子"
                    className="border-input bg-background font-mono text-foreground"
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                  />
                  <Button variant="outline" className="border-border" onClick={submit} disabled={solved}>
                    提交
                  </Button>
                </div>
                <div className="flex items-center gap-4 font-mono text-sm">
                  <span className="text-muted-foreground">尝试 {tries} 次</span>
                  {solved && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ✓ 分解成功：{ch.n} = {ch.p} × {ch.q}（耗时 {(elapsed / 1000).toFixed(1)} 秒）
                    </span>
                  )}
                </div>
                {solved && bits >= 10 && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    你已经感到吃力了——而真实 RSA 用的是 1024 比特素数。
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2 rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <TrendingUp className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
                正向 vs 逆向的成本鸿沟
              </div>
              <div className="space-y-2 font-mono text-xs">
                <div>
                  <div className="mb-1 flex justify-between text-muted-foreground">
                    <span>正向：乘法</span>
                    <span>≈ {forwardOps} 次位运算</span>
                  </div>
                  <div className="h-3 rounded bg-emerald-500/70" style={{ width: '6%' }} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-muted-foreground">
                    <span>逆向：蛮力试除</span>
                    <span>≈ 2^{bits} = {invertOps.toLocaleString()} 次</span>
                  </div>
                  <div
                    className="h-3 rounded bg-red-500/70 transition-all"
                    style={{ width: `${Math.min(100, (bits / 16) * 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                正向成本按多项式增长，逆向成本随比特数指数爆炸——拖动滑块看鸿沟张开。
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <DoorClosed className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
                定义里的三个暗坑
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  挑战 y 必须由<span className="text-foreground">随机 x</span> 算出——
                  不能让敌手自选 y。例如模平方中直接随机挑的 y 可能根本不是平方数，
                  「求逆失败」并不代表函数安全。
                </li>
                <li>
                  成功只要求 <span className="text-foreground">f(x′)=y</span>，不要求 x′=x——
                  找到任意原像都算赢。
                </li>
                <li>
                  「易于计算」只要求存在<span className="text-foreground">某个</span>多项式算法
                  算出同样的输出，未必要用原本的定义方式。
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">候选单向函数家族</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidates.map((c) => (
                <div
                  key={c.name}
                  className={cn('rounded-lg border border-border bg-muted/40 p-3')}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                    <code className="font-mono text-xs text-fuchsia-700 dark:text-fuchsia-300">{c.f}</code>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                还有第五位候选——密码学安全哈希函数，后面会专门学习。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
