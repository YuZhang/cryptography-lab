import { useMemo, useState } from 'react'
import { ArrowDownUp, ChevronLeft, ChevronRight, CircleHelp, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Formula, Section } from '../shared'
import {
  FEISTEL_INFO,
  feistelDecryptTraced,
  feistelEncryptTraced,
  hex1,
  type FeistelKind,
} from '@/lib/blockcipher'
import { cn } from '@/lib/utils'

function LrRow({ l, r, prevL, prevR }: { l: number; r: number; prevL?: number; prevR?: number }) {
  const cell = (v: number, changed: boolean) => (
    <span
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded border font-mono text-sm',
        changed
          ? 'border-rose-500/60 bg-rose-500/20 text-rose-700 dark:text-rose-300'
          : 'border-border bg-secondary text-secondary-foreground'
      )}
    >
      {v.toString(2).padStart(4, '0')}
    </span>
  )
  return (
    <div className="flex items-center justify-center gap-6">
      <div className="text-center">
        <div className="mb-1 text-xs text-muted-foreground">L = 0x{hex1(l)}</div>
        {cell(l, prevL !== undefined && prevL !== l)}
      </div>
      <div className="text-center">
        <div className="mb-1 text-xs text-muted-foreground">R = 0x{hex1(r)}</div>
        {cell(r, prevR !== undefined && prevR !== r)}
      </div>
    </div>
  )
}

export default function BcFeistel() {
  const [lHex, setLHex] = useState('9')
  const [rHex, setRHex] = useState('5')
  const [rounds, setRounds] = useState(4)
  const [kind, setKind] = useState<FeistelKind>('and')
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<'enc' | 'dec'>('enc')
  const [quizRevealed, setQuizRevealed] = useState(false)

  const l0 = parseInt(lHex, 16)
  const r0 = parseInt(rHex, 16)
  const valid = !isNaN(l0) && l0 <= 0xf && !isNaN(r0) && r0 <= 0xf

  const encStages = useMemo(
    () => (valid ? feistelEncryptTraced(l0, r0, 0xb, rounds, kind) : []),
    [l0, r0, rounds, kind, valid]
  )
  const decStages = useMemo(() => {
    if (!valid || encStages.length === 0) return []
    const last = encStages[encStages.length - 1]
    return feistelDecryptTraced(last.l, last.r, 0xb, rounds, kind)
  }, [valid, encStages, rounds, kind])

  const stages = mode === 'enc' ? encStages : decStages
  const cur = Math.min(step, Math.max(0, stages.length - 1))
  const roundTripOk =
    decStages.length > 0 &&
    decStages[decStages.length - 1].l === l0 &&
    decStages[decStages.length - 1].r === r0

  return (
    <Section
      id="bc-feistel"
      index="03 · Feistel 网络"
      title="不可逆的零件，可逆的整体"
      subtitle="SPN 要求 S 盒必须可逆，设计束手束脚。Feistel 网络换了个思路：轮函数 f 随便选——哪怕信息被它抹得一干二净，整个网络照样是排列。DES 就靠这个骨架跑了 16 轮。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <ArrowDownUp className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              Feistel 步进器（4+4 比特）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>Lᵢ = Rᵢ₋₁ · Rᵢ = Lᵢ₋₁ ⊕ fᵢ(Rᵢ₋₁)</Formula>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">L₀（4 比特，0–F）</label>
                <Input
                  value={lHex}
                  onChange={(e) => {
                    setLHex(e.target.value)
                    setStep(0)
                    setMode('enc')
                  }}
                  className="border-input bg-background font-mono text-foreground"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">R₀（4 比特，0–F）</label>
                <Input
                  value={rHex}
                  onChange={(e) => {
                    setRHex(e.target.value)
                    setStep(0)
                    setMode('enc')
                  }}
                  className="border-input bg-background font-mono text-foreground"
                />
              </div>
            </div>
            {!valid && <p className="text-xs text-red-600 dark:text-red-400">请输入 0–F 的十六进制</p>}
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">轮函数 f（注意是否可逆）</label>
              <ToggleGroup
                type="single"
                value={kind}
                onValueChange={(v) => {
                  if (v) {
                    setKind(v as FeistelKind)
                    setStep(0)
                    setMode('enc')
                  }
                }}
                className="flex-wrap justify-start"
              >
                {(Object.keys(FEISTEL_INFO) as FeistelKind[]).map((k) => (
                  <ToggleGroupItem key={k} value={k} className="border-border text-xs">
                    {FEISTEL_INFO[k].name}
                    {!FEISTEL_INFO[k].invertible && ' ⚠不可逆'}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <p className="mt-1 text-xs text-muted-foreground">{FEISTEL_INFO[kind].desc}</p>
            </div>
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">轮数 = {rounds}</label>
              <Slider
                value={[rounds]}
                min={1}
                max={8}
                step={1}
                onValueChange={([v]) => {
                  setRounds(v)
                  setStep(0)
                  setMode('enc')
                }}
              />
            </div>

            {stages.length > 0 && (
              <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-border"
                    disabled={cur === 0}
                    onClick={() => setStep(cur - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground">
                      {mode === 'enc' ? '' : '解密 · '}
                      {stages[cur].label}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      第 {cur + 1}/{stages.length} 步
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-border"
                    disabled={cur >= stages.length - 1}
                    onClick={() => setStep(cur + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <LrRow
                  l={stages[cur].l}
                  r={stages[cur].r}
                  prevL={cur > 0 ? stages[cur - 1].l : undefined}
                  prevR={cur > 0 ? stages[cur - 1].r : undefined}
                />
                {mode === 'dec' && cur === stages.length - 1 && (
                  <p
                    className={cn(
                      'text-center text-sm',
                      roundTripOk
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {roundTripOk ? '✓ 完好无损地回到了 (L₀, R₀)' : '✗ 没有还原'}
                  </p>
                )}
              </div>
            )}

            <Button
              variant="outline"
              className="border-border"
              onClick={() => {
                setMode(mode === 'enc' ? 'dec' : 'enc')
                setStep(0)
              }}
            >
              <Undo2 className="mr-2 h-4 w-4" />
              {mode === 'enc' ? '切换到解密（从密文倒推）' : '切换到加密'}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">为什么 f 不可逆也能解密？</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                解密不需要反算 f：第 i 轮的输入其实就写在输出里——
                <span className="text-foreground">Rᵢ₋₁ = Lᵢ</span>，于是
              </p>
              <Formula>Lᵢ₋₁ = Rᵢ ⊕ fᵢ(Lᵢ)</Formula>
              <p>
                f 只被<span className="text-foreground">正向计算</span>一次再异或掉，从来不需要求逆。
                这就是 Luby-Rackoff 定理的立足点：
                <span className="text-foreground">无论 f 是什么、多少轮，Feistel 网络总是排列。</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CircleHelp className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                课堂例题（先心算，再揭晓）
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                输入 (L₀, R₀) 经过 r 轮 Feistel 网络，若每轮的 f 都是
                <span className="text-foreground">零函数</span>，输出是什么？若每轮 f 都是
                <span className="text-foreground">恒等函数</span>呢？
              </p>
              <Button
                variant="outline"
                className="border-border"
                onClick={() => setQuizRevealed(!quizRevealed)}
              >
                {quizRevealed ? '收起答案' : '揭晓答案'}
              </Button>
              {quizRevealed && (
                <div className="space-y-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3">
                  <p>
                    <span className="text-foreground">f = 0</span>：Rᵢ = Lᵢ₋₁，两轮一循环——
                    奇数轮输出 (R₀, L₀)，偶数轮输出 (L₀, R₀)，等于只做对调。
                  </p>
                  <p>
                    <span className="text-foreground">f = 恒等</span>：Rᵢ = Lᵢ₋₁ ⊕ Rᵢ₋₁，
                    (L, R) 像斐波那契一样异或滚动——周期为 3，每 3 轮恰好回到输入。
                  </p>
                  <p className="text-xs">
                    把上面轮函数切到对应选项，步进验证一下。结论：Feistel 的安全性完全押在 f
                    的质量上，结构本身不提供任何混淆。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
