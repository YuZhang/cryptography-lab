import { useState } from 'react'
import { Blocks, ShieldCheck, ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Formula, Section } from '../shared'
import {
  cbcMacRaw,
  hex2,
  varMac,
  varVrfy,
  type CbcMacOpts,
  type VarMacKind,
} from '@/lib/machash'
import { cn } from '@/lib/utils'

const K = 0x77 // 挑战者密钥
const K2 = 0x99 // ECBC 第二密钥

const BLOCKS = [
  { v: 0x11, label: '转100' },
  { v: 0x22, label: '给Bob' },
  { v: 0x33, label: '转900' },
  { v: 0x44, label: '给Eve' },
]
const bl = (v: number) => BLOCKS.find((b) => b.v === v)?.label ?? `0x${hex2(v)}`

const KIND_INFO: Record<VarMacKind, { name: string; formula: string; attack: string }> = {
  xor: {
    name: '建议1：异或所有块',
    formula: 't = Mac′(⊕ᵢ mᵢ)',
    attack: '换位攻击：查询 (A,B)，把 (B,A) 当新消息——异或结果相同，标签照用。',
  },
  perblock: {
    name: '建议2：逐块认证',
    formula: 'tᵢ = Mac′(mᵢ)',
    attack: '混拼攻击：查询 (A,B) 和 (C,D)，拼出从未发送过的 (A,D)，标签 (t₁,t₃)。',
  },
  indexed: {
    name: '建议3：带序号逐块认证',
    formula: 'tᵢ = Mac′(i‖mᵢ)',
    attack: '截断攻击：查询 (A,B)，把 (A) 当新消息——t₁ 恰好是它的有效标签。',
  },
}

export default function MhVariable() {
  const [kind, setKind] = useState<VarMacKind>('xor')
  const [log, setLog] = useState<string[]>([])
  const [forgedOk, setForgedOk] = useState<boolean | null>(null)

  // CBC-MAC 攻防台状态
  const [fix, setFix] = useState<'none' | 'length' | 'ecbc'>('none')
  const [cbcLog, setCbcLog] = useState<string[]>([])
  const [cbcVerdict, setCbcVerdict] = useState<boolean | null>(null)

  const A = BLOCKS[0].v
  const B = BLOCKS[1].v
  const C = BLOCKS[2].v
  const D = BLOCKS[3].v

  const runVarAttack = () => {
    const lines: string[] = []
    let forgedBlocks: number[] = []
    let forgedTag: number[] = []
    if (kind === 'xor') {
      const t = varMac(K, [A, B], 'xor')
      lines.push(`查询 (${bl(A)}, ${bl(B)}) → 标签 0x${hex2(t[0])}`)
      forgedBlocks = [B, A]
      forgedTag = t
      lines.push(`伪造 (${bl(B)}, ${bl(A)})：异或值相同，标签直接复用`)
    } else if (kind === 'perblock') {
      const t1 = varMac(K, [A, B], 'perblock')
      const t2 = varMac(K, [C, D], 'perblock')
      lines.push(`查询 (${bl(A)}, ${bl(B)}) → [0x${hex2(t1[0])}, 0x${hex2(t1[1])}]`)
      lines.push(`查询 (${bl(C)}, ${bl(D)}) → [0x${hex2(t2[0])}, 0x${hex2(t2[1])}]`)
      forgedBlocks = [A, D]
      forgedTag = [t1[0], t2[1]]
      lines.push(`伪造 (${bl(A)}, ${bl(D)})：从未发送过，但两块标签都见过`)
    } else {
      const t = varMac(K, [A, B], 'indexed')
      lines.push(`查询 (${bl(A)}, ${bl(B)}) → [0x${hex2(t[0])}, 0x${hex2(t[1])}]`)
      forgedBlocks = [A]
      forgedTag = [t[0]]
      lines.push(`伪造 (${bl(A)})：丢掉第二块，t₁ 恰好是首块的有效标签`)
    }
    setLog(lines)
    setForgedOk(varVrfy(K, forgedBlocks, forgedTag, kind))
  }

  const runCbcAttack = () => {
    const opts: CbcMacOpts = {
      ivZero: true,
      lastOnly: true,
      prependLength: fix === 'length',
      ecbcK2: fix === 'ecbc' ? K2 : undefined,
    }
    const m = A
    const q = cbcMacRaw(K, [m], opts)
    const tVisible = q.tag[q.tag.length - 1]
    const lines = [`查询单块消息 (${bl(m)}) → 标签 0x${hex2(tVisible)}`]
    // 敌手只能看到可见标签；裸版下可见标签即内部链接值 t，追加块取 m₂ = m ⊕ t
    // 加长度块后整条链从第一步就不同；ECBC 下可见标签是 F_k₂(t)，敌手拿不到 t
    const guess = m ^ tVisible
    const forged = [m, guess]
    const fv = cbcMacRaw(K, forged, opts)
    const forgedTag = fv.tag[fv.tag.length - 1]
    lines.push(`伪造 (${bl(m)}, 0x${hex2(guess)})：让第二块输入异或后回到第一块的中间值`)
    const ok = forgedTag === tVisible
    setCbcLog(lines)
    setCbcVerdict(ok)
  }

  return (
    <Section
      id="mh-variable"
      index="02 · 变长消息"
      title="三个馊主意，与 CBC-MAC 的正确做法"
      subtitle="PRF 直接当 MAC 只能保护固定长度。把消息切成块之后，三个「看起来很自然」的扩展全部当场阵亡；CBC-MAC 才是正解——但必须 IV=0、只输出末块，而且裸版依然挡不住追加攻击。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Blocks className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              馊主意试验场（块：转100 / 给Bob / 转900 / 给Eve）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleGroup
              type="single"
              value={kind}
              onValueChange={(v) => {
                if (v) {
                  setKind(v as VarMacKind)
                  setLog([])
                  setForgedOk(null)
                }
              }}
              className="flex-wrap justify-start"
            >
              {(Object.keys(KIND_INFO) as VarMacKind[]).map((k) => (
                <ToggleGroupItem key={k} value={k} className="border-border text-xs">
                  {KIND_INFO[k].name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Formula>{KIND_INFO[kind].formula}</Formula>
            <p className="text-xs leading-relaxed text-muted-foreground">{KIND_INFO[kind].attack}</p>
            <Button onClick={runVarAttack} className="bg-teal-600 text-white hover:bg-teal-700">
              执行攻击
            </Button>
            {log.length > 0 && (
              <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
                {log.map((l, i) => (
                  <div key={i} className="text-muted-foreground">{l}</div>
                ))}
                {forgedOk !== null && (
                  <div
                    className={cn(
                      'border-t border-border pt-2',
                      forgedOk ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                    )}
                  >
                    {forgedOk ? '✗ 验证通过——伪造成功，方案不安全' : '✓ 验证失败'}
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              三个方案的病根相同：标签之间、块之间缺乏<span className="text-foreground">绑定整个消息</span>的链条。
              CBC-MAC 把每一块都链进上一块的输出里。
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              {cbcVerdict ? (
                <ShieldOff className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              )}
              CBC-MAC 攻防台（IV=0，只输出末块）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>t₀=0 · tᵢ = F_k(tᵢ₋₁ ⊕ mᵢ) · tag = 末块</Formula>
            <p className="text-sm leading-relaxed text-muted-foreground">
              裸 CBC-MAC 对<span className="text-foreground">固定长度</span>安全，但变长就出事：
              查到单块 m 的标签 t 后，追加块 (m⊕t) 让第二块输入回到 F_k(m)，输出还是 t——
              选一种修法再攻击试试：
            </p>
            <ToggleGroup
              type="single"
              value={fix}
              onValueChange={(v) => {
                if (v) {
                  setFix(v as 'none' | 'length' | 'ecbc')
                  setCbcLog([])
                  setCbcVerdict(null)
                }
              }}
              className="flex-wrap justify-start"
            >
              <ToggleGroupItem value="none" className="border-border text-xs">裸版（无修法）</ToggleGroupItem>
              <ToggleGroupItem value="length" className="border-border text-xs">开头加长度块</ToggleGroupItem>
              <ToggleGroupItem value="ecbc" className="border-border text-xs">ECBC：F_k₂ 加密末块</ToggleGroupItem>
            </ToggleGroup>
            <Button onClick={runCbcAttack} className="bg-teal-600 text-white hover:bg-teal-700">
              发起追加攻击
            </Button>
            {cbcLog.length > 0 && (
              <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
                {cbcLog.map((l, i) => (
                  <div key={i} className="text-muted-foreground">{l}</div>
                ))}
                {cbcVerdict !== null && (
                  <div
                    className={cn(
                      'border-t border-border pt-2',
                      cbcVerdict ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                    )}
                  >
                    {cbcVerdict
                      ? '✗ 标签相同——追加攻击成功（裸版不安全）'
                      : fix === 'ecbc'
                        ? '✓ 攻击失败：敌手看不到内部链接值 t（被 F_k₂ 盖住），算不出正确的追加块'
                        : '✓ 攻击失败：长度块变了，整条链从第一步就不同'}
                  </div>
                )}
              </div>
            )}
            <p className="text-xs leading-relaxed text-muted-foreground">
              第三种修法是<span className="text-foreground">输入长度密钥分离</span>：k_ℓ = F_k(ℓ)，
              不同长度用不同密钥。CMAC 则更进一步：不填充哑块、用 k₁/k₂ 区分最后一块是否补了哑块——
              这些都是工业标准里的真实方案。
            </p>
            <p className="text-xs text-muted-foreground">
              补充：为什么 IV 必须为 0？随机 IV 下敌手把 m₁′ = IV′⊕IV⊕m₁ 配上 (IV′, t₁)
              就伪造成功——第四讲的 CBC 加密教训换个皮肤重现。同理，标签若包含全部中间块，
              mᵢ′ = tᵢ₋₁′ ⊕ tᵢ₋₁ ⊕ mᵢ 直接把链条偷走。
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
