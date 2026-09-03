import { useMemo, useState } from 'react'
import { ArrowDown, Boxes, Cog } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { prgStream, seedFromString } from '@/lib/prg'
import { bytesToHex, bytesToText, textToBytes, xorBytes } from '@/lib/otp'
import { Formula, Section } from '../shared'

function HexRow({ label, hex, tone }: { label: string; hex: string; tone?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <div
        className={`break-all rounded-lg border border-border bg-muted/60 p-3 font-mono text-xs leading-relaxed ${tone ?? 'text-foreground'}`}
      >
        {hex || '…'}
      </div>
    </div>
  )
}

/** 规约证明流程的一步 */
function ProofStep({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full rounded-lg border border-border bg-muted/40 p-3 text-center text-xs leading-relaxed text-foreground">
        {children}
      </div>
      <ArrowDown className="my-1 h-4 w-4 text-sky-500" />
    </div>
  )
}

export default function CsReduction() {
  const [keyStr, setKeyStr] = useState('k3y')
  const [msg, setMsg] = useState('computational security lets short keys protect long messages!')

  const mBytes = useMemo(() => textToBytes(msg), [msg])
  const seed = useMemo(() => seedFromString(keyStr || ' '), [keyStr])
  const pad = useMemo(() => prgStream(seed, Math.max(mBytes.length, 1)), [seed, mBytes.length])
  const cipher = xorBytes(mBytes, pad)
  const back = xorBytes(cipher, pad)

  return (
    <Section
      id="cs-reduction"
      index="03 · 构造与证明"
      title="流密码构造与规约法证明"
      subtitle="把短密钥喂给 PRG，得到与明文等长的伪随机 pad，再像一次一密那样异或——短密钥加密长消息。安全吗？用规约法把「破解它」归约到「区分 PRG」这个假设难题上。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 流密码构造 */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Cog className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              动手：短密钥加密长消息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>Gen: k ← {'{'}0,1{'}'}ⁿ · Enc: c = G(k) ⊕ m · Dec: m = G(k) ⊕ c</Formula>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  短密钥 k（任意短字符串）
                </label>
                <Input
                  value={keyStr}
                  onChange={(e) => setKeyStr(e.target.value)}
                  className="border-input bg-background font-mono text-foreground"
                />
                <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                  种子 = {seed.toString(16).padStart(8, '0')}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  明文 m（{mBytes.length} 字节，远长于密钥）
                </label>
                <Input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="border-input bg-background font-mono text-foreground"
                />
              </div>
            </div>
            <HexRow label="pad = G(k)（与明文等长的伪随机串）" hex={bytesToHex(pad)} tone="text-sky-700 dark:text-sky-300" />
            <HexRow label="密文 c = G(k) ⊕ m" hex={bytesToHex(cipher)} tone="text-amber-700 dark:text-amber-300" />
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 font-mono text-xs text-emerald-700 dark:text-emerald-300">
              解密验证 Dec: G(k) ⊕ c → "{bytesToText(back)}"
            </div>
            <p className="text-xs text-muted-foreground">
              演示用的 xorshift 只是教学玩具（可被区分）；真实世界用 AES-CTR、ChaCha20
              等经过公开检验的构造。定理：若 G 是 PRG，则该方案是窃听下不可区分的。
            </p>
          </CardContent>
        </Card>

        {/* 规约证明 */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Boxes className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              规约证明：把破解者变成零件
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col">
              <ProofStep>
                <span className="font-semibold">假设</span>：G 是 PRG——任何 PPT
                区分器都分不清 G(s) 与真随机串 r
              </ProofStep>
              <ProofStep>
                <span className="font-semibold">反设</span>：存在 PPT 敌手 A 以 1/2 + ε(n)
                破解加密方案 Π（ε 不可忽略）
              </ProofStep>
              <ProofStep>
                <span className="font-semibold">规约</span>：构造区分器 D，把 A
                当作子程序——D 收到串 w 后扮演挑战者：A 交出 m₀, m₁；D 掷币选 b，直接以
                c = w ⊕ m_b 回应；A 猜对则 D 输出 1
              </ProofStep>
              <ProofStep>
                <span className="font-semibold">分析</span>：w = G(k) 时 A 面对 Π，D 输出 1
                的概率 = 1/2 + ε(n)；w = r 时 A 面对的恰是一次一密 Π̃，概率 =
                <span className="text-emerald-600 dark:text-emerald-400">恰好 1/2</span>
              </ProofStep>
              <div className="w-full rounded-lg border border-sky-500/40 bg-sky-500/5 p-3 text-center text-xs leading-relaxed text-foreground">
                <span className="font-semibold">矛盾</span>：两个概率之差 = ε(n)，但 PRG
                定义要求它可忽略 ⇒ ε(n) 必可忽略 ⇒ Π 安全 ∎
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              规约 A ≤ B 的直觉：解决 A 不比解决 B 难（矩形面积规约到边长测量；平方规约到乘法——反过来呢？）。
              安全证明则是反用：能破 Π 就能区分 G，与假设矛盾。同类练习：若 F 是 PRG，
              把输出按位取反得到 G——G 还是 PRG 吗？（是：把区分 F 的输入取反即可规约。）
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
