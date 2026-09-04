import { useMemo, useState } from 'react'
import { Crosshair, Database, KeyRound, Swords } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Formula, Section } from '../shared'
import { mitmDemo, type MitmResult } from '@/lib/blockcipher'
import { cn } from '@/lib/utils'

export default function BcMitm() {
  const [result, setResult] = useState<MitmResult | null>(null)
  const [n, setN] = useState(28)

  const attack = () => setResult(mitmDemo(0x3c, 0xa5))

  const stats = useMemo(
    () => ({
      naive: 2 * n,
      mitm: n + 1,
      space: n,
    }),
    [n]
  )

  return (
    <Section
      id="bc-mitm"
      index="04 · 双重加密的幻觉"
      title="中间相遇攻击"
      subtitle="DES 的 56 比特密钥太短，最直接的补救是双重加密：密钥翻倍到 112 比特，总该安全一倍吧？中间相遇攻击说：不。它在时间与蛮力 DES 几乎相同的代价下拆穿双重 DES——安全强度的账，从来不是密钥长度简单相加。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Swords className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              亲手发起 MITM（玩具版：8 比特密钥）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>y = F_k₂(F_k₁(x)) · 找 z₀ = F_k₁(x) = F⁻¹_k₂(y)</Formula>
            <p className="text-sm leading-relaxed text-muted-foreground">
              挑战者已用随机密钥对 (k₁, k₂) 做了双重加密。你有一对明密文（已知明文攻击）：
              <span className="text-foreground">从明文正向</span>枚举全部 2⁸ 个 k₁ 存下中间值，
              <span className="text-foreground">从密文反向</span>枚举全部 2⁸ 个 k₂——两张表在中间相遇。
            </p>
            <Button onClick={attack} className="bg-rose-600 text-white hover:bg-rose-700">
              {result ? '换一组密钥再来一次' : '发起中间相遇攻击'}
            </Button>

            {result && (
              <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm">
                <div className="text-muted-foreground">
                  x = 0x{result.x.toString(16).padStart(2, '0')} · y = 0x
                  {result.y.toString(16).padStart(2, '0')}
                </div>
                <div className="text-muted-foreground">
                  正向表 256 项 · 反向表 256 项 · 相遇点 z₀ = 0x
                  {result.z0.toString(16).padStart(2, '0')}
                </div>
                <div className="text-muted-foreground">
                  候选密钥对：<span className="text-amber-700 dark:text-amber-300">{result.candidates.length} 对</span>
                  <span className="text-xs">（≈ 2ⁿ 个假阳性，符合理论预期）</span>
                </div>
                <div className="text-muted-foreground">
                  用第二对明密文筛选 ⇒ 幸存：
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {result.survivor
                      ? ` (0x${result.survivor[0].toString(16).padStart(2, '0')}, 0x${result.survivor[1]
                          .toString(16)
                          .padStart(2, '0')})`
                      : ' 无'}
                  </span>
                </div>
                <div
                  className={cn(
                    'border-t border-border pt-2',
                    result.survivor &&
                      result.survivor[0] === result.k1 &&
                      result.survivor[1] === result.k2
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-muted-foreground'
                  )}
                >
                  真实密钥：(0x{result.k1.toString(16).padStart(2, '0')}, 0x
                  {result.k2.toString(16).padStart(2, '0')})
                  {result.survivor &&
                    result.survivor[0] === result.k1 &&
                    result.survivor[1] === result.k2 &&
                    ' —— 正中目标，密钥已破'}
                </div>
                <p className="font-sans text-xs leading-relaxed text-muted-foreground">
                  只算了约 2·2⁸ = 512 次加密（+256 项存储），而不是蛮力的 2¹⁶ = 65536 次。
                  时间 O(2ⁿ)、空间 O(2ⁿ)——典型的空间换时间。
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Database className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                复杂度对比（n = 单密钥长度）
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-xs text-muted-foreground">n = {n} 比特</label>
                <Slider value={[n]} min={8} max={64} step={4} onValueChange={([v]) => setN(v)} />
              </div>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
                  <span className="text-muted-foreground">蛮力双重加密</span>
                  <span className="text-foreground">2^{stats.naive} 次</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-500/5 p-3">
                  <span className="text-muted-foreground">MITM 时间</span>
                  <span className="text-rose-700 dark:text-rose-300">2^{stats.mitm} 次</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-500/5 p-3">
                  <span className="text-muted-foreground">MITM 空间</span>
                  <span className="text-rose-700 dark:text-rose-300">2^{stats.space} 项</span>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {n}=56 时：蛮力 2¹¹²，MITM 只需 2⁵⁷——
                <span className="text-foreground">双重 DES 在时间复杂性上与 DES 没有区别</span>。
                这就是它从未被采用的原因。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <KeyRound className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                两种真正有效的补救
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                <span className="text-foreground">DESX（密钥白化）</span>：
                y = k₃ ⊕ F_k₂(x ⊕ k₁)。想拿到中间值得同时猜两个密钥，MITM 复杂度升到
                <span className="text-foreground"> 2^(64+56) = 2¹²⁰</span>。
              </p>
              <p>
                <span className="text-foreground">三重 DES（EDE）</span>：加密-解密-加密。
                三把不同密钥时 MITM 需 2²ⁿ；k₁=k₃ 的两密钥版本在 2ⁿ 个明密文对下退化为 2ⁿ。
                k₁=k₂=k₃ 时退化为普通 DES——向后兼容的精心设计。
              </p>
              <p className="text-xs">
                共同点：都不动 DES 内部（从内部修改会失去几十年积累的信心），只做
                <span className="text-foreground">黑盒组合</span>。
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-500/30 bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Crosshair className="h-5 w-5" /> DES 本体：16 轮 Feistel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm leading-relaxed text-muted-foreground">
              <p>
                64 比特分组 · 56 比特密钥（64 位含 8 个校验位）· 每轮 48 比特子密钥 ·
                轮函数 f 不可逆（32 位 I/O，S 盒 6→4 位）。注意还有
                <span className="text-foreground">弱密钥</span>（密钥编排产出全同子密钥）与
                <span className="text-foreground">半弱密钥</span>（只产两个不同子密钥）——遇到就得换。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
