import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, KeyRound, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Formula, Section } from '../shared'
import { spnEncryptTraced, hex4, invertSbox, sboxLayer, roundKey, HEYS_SBOX } from '@/lib/blockcipher'
import { cn } from '@/lib/utils'

/** 16 比特状态条：4 组 4 比特 */
function BitRow({ state, prev }: { state: number; prev?: number }) {
  return (
    <div className="flex justify-center gap-3 font-mono">
      {[0, 1, 2, 3].map((g) => (
        <div key={g} className="flex gap-1">
          {[0, 1, 2, 3].map((i) => {
            const bit = (state >> (g * 4 + i)) & 1
            const changed = prev !== undefined && ((prev >> (g * 4 + i)) & 1) !== bit
            return (
              <span
                key={i}
                className={cn(
                  'flex h-8 w-7 items-center justify-center rounded border text-sm',
                  changed
                    ? 'border-rose-500/60 bg-rose-500/20 text-rose-700 dark:text-rose-300'
                    : bit
                      ? 'border-border bg-secondary text-secondary-foreground'
                      : 'border-border bg-muted/50 text-muted-foreground'
                )}
              >
                {bit}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function BcSpn() {
  const [ptHex, setPtHex] = useState('26B9')
  const [keyHex, setKeyHex] = useState('3A91')
  const [rounds, setRounds] = useState(3)
  const [finalMixing, setFinalMixing] = useState(true)
  const [step, setStep] = useState(0)

  const pt = parseInt(ptHex, 16)
  const key = parseInt(keyHex, 16)
  const valid = !isNaN(pt) && pt <= 0xffff && !isNaN(key) && key <= 0xffff

  const stages = useMemo(
    () => (valid ? spnEncryptTraced(pt, key, rounds, HEYS_SBOX, finalMixing) : []),
    [pt, key, rounds, finalMixing, valid]
  )
  const cur = Math.min(step, Math.max(0, stages.length - 1))

  // 去掉末尾密钥混合时，攻击者可公开倒推最后一轮
  const undoLast = useMemo(() => {
    if (!valid || finalMixing || stages.length === 0) return null
    const ct = stages[stages.length - 1].state
    const inv = sboxLayer(ct, invertSbox(HEYS_SBOX))
    return { ct, undone: inv ^ roundKey(key, rounds - 1) }
  }, [valid, finalMixing, stages, key, rounds])

  return (
    <Section
      id="bc-spn"
      index="01 · 替换-置换网络"
      title="亲手搭一台 SPN"
      subtitle="香农的混淆-扩散范式落地：密钥混合 + S 盒替换（混淆）+ P 盒置换（扩散），一轮一轮堆出「看上去随机」的排列。这是一台 16 比特玩具 SPN——4 个 4 比特 S 盒，P 盒把每个 S 盒的输出摊到下一轮的四个不同 S 盒。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <KeyRound className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              SPN 实验台
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>c = SPN_k(x)：逐轮 [ ⊕k → S盒 → P盒 ]，末尾再 ⊕k</Formula>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">明文（16 比特，十六进制）</label>
                <Input
                  value={ptHex}
                  onChange={(e) => {
                    setPtHex(e.target.value)
                    setStep(0)
                  }}
                  className="border-input bg-background font-mono text-foreground"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">主密钥（16 比特）</label>
                <Input
                  value={keyHex}
                  onChange={(e) => {
                    setKeyHex(e.target.value)
                    setStep(0)
                  }}
                  className="border-input bg-background font-mono text-foreground"
                />
              </div>
            </div>
            {!valid && <p className="text-xs text-red-600 dark:text-red-400">请输入 0000–FFFF 的十六进制</p>}
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">轮数 R = {rounds}</label>
              <Slider
                value={[rounds]}
                min={1}
                max={4}
                step={1}
                onValueChange={([v]) => {
                  setRounds(v)
                  setStep(0)
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
                    <div className="text-sm font-medium text-foreground">{stages[cur].label}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      0x{hex4(stages[cur].state)} · 第 {cur + 1}/{stages.length} 步
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
                <BitRow state={stages[cur].state} prev={cur > 0 ? stages[cur - 1].state : undefined} />
                <p className="text-center text-xs text-muted-foreground">
                  红色比特 = 相对上一步发生变化的比特（⊕k 与 S 盒是混淆，P 盒只搬动位置）
                </p>
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm text-foreground">末尾密钥混合（最后一轮 ⊕k）</span>
              <Switch
                checked={finalMixing}
                onCheckedChange={(v) => {
                  setFinalMixing(v)
                  setStep(0)
                }}
              />
            </div>
            {!finalMixing && undoLast && (
              <div className="space-y-2 rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm">
                <div className="flex items-center gap-2 font-medium text-red-600 dark:text-red-400">
                  <ShieldAlert className="h-4 w-4" /> 弱点暴露：最后一轮白干了
                </div>
                <p className="text-muted-foreground">
                  没有末尾密钥混合，最后一轮的 S 盒与 P 盒都是
                  <span className="text-foreground">公开可逆</span>的：任何人都能把密文 0x{hex4(undoLast.ct)}
                  倒过 S 盒得到 0x{hex4(sboxLayer(undoLast.ct, invertSbox(HEYS_SBOX)))}——
                  最后一轮对安全性毫无贡献，等于少加密一整轮。
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">为什么不能直接存一张随机排列表？</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                ℓ 比特分组上的真随机排列需要存 2<sup>ℓ</sup>! 种映射之一——光是描述它就要约
                <span className="text-foreground"> ℓ·2<sup>ℓ</sup> </span>
                比特。ℓ=128 时这是天文数字。SPN 的思路：
                <span className="text-foreground">
                  大随机排列 ≈ 若干小随机排列（S 盒）的复合
                </span>
                ，F_k(x) = f₁(x₁)‖f₂(x₂)‖…‖f_i(x_i)，再靠 P 盒把小块的影响搅到一起。
              </p>
              <p>
                因此块密码是<span className="text-foreground">启发式构造</span>：没有归约证明，
                它的"优秀"标准是——已知最佳攻击的复杂度 ≈ 蛮力搜密钥。
                112 比特密钥若能在 2<sup>56</sup> 内被破，就是不安全。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">设计原则 1：S 盒必须可逆</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>
                密钥混合（异或）和 P 盒（置换）都是排列。整条链要是排列，剩下的 S 盒就必须
                <span className="text-foreground">一对一且满射</span>。
              </p>
              <p className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
                定理：S 盒可逆 ⇒ 无论密钥编排与轮数，任意 k 下 F_k 都是排列。
              </p>
              <p>下一节的 Feistel 网络会展示如何绕过这个约束。</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
