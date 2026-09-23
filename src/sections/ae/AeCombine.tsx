import { useState } from 'react'
import { Eye, Gavel, ShieldCheck, Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Formula, Section } from '../shared'
import { ateDecrypt, ateEncrypt, hex2, toyMacByte, type AteChallenge } from '@/lib/ae'
import { cn } from '@/lib/utils'

const KE = 0x11
const KM = 0x22

const combos = [
  {
    name: '加密并认证 E&A',
    used: 'SSH',
    formula: 'c = Enc(m), t = Mac(m)',
    flaw: 'MAC 不保机密性：Mac′(m) = (m, Mac(m)) 是合法 MAC，标签直接带着明文。',
  },
  {
    name: '先认证后加密 AtE',
    used: 'SSL',
    formula: 'c = Enc(m ‖ Mac(m))',
    flaw: '密文有效性泄漏明文比特——左侧游戏亲手复现。',
  },
  {
    name: '先加密后认证 EtA',
    used: 'IPsec',
    formula: 'c = Enc(m), t = Mac(c)',
    flaw: null,
  },
]

export default function AeCombine() {
  const [ch, setCh] = useState<AteChallenge | null>(null)
  const [flipped, setFlipped] = useState<number[] | null>(null)
  const [oracleAns, setOracleAns] = useState<'valid' | 'invalid' | null>(null)
  const [guess, setGuess] = useState<0 | 1 | null>(null)
  const [score, setScore] = useState({ wins: 0, total: 0 })
  const [eaRevealed, setEaRevealed] = useState(false)

  const newChallenge = () => {
    const m = (Math.random() < 0.5 ? 0 : 1) as 0 | 1
    setCh(ateEncrypt(m, KE, KM, Math.floor(Math.random() * 256)))
    setFlipped(null)
    setOracleAns(null)
    setGuess(null)
  }

  const doFlip = () => {
    if (!ch) return
    setFlipped([ch.c[0] ^ 1, ch.c[1] ^ 1, ...ch.c.slice(2)])
    setOracleAns(null)
    setGuess(null)
  }

  const askOracle = () => {
    if (!flipped || !ch) return
    setOracleAns(ateDecrypt(flipped, KE, KM, ch.iv) === null ? 'invalid' : 'valid')
  }

  const makeGuess = (g: 0 | 1) => {
    if (!ch || guess !== null) return
    setGuess(g)
    setScore((s) => ({ wins: s.wins + (g === ch.m ? 1 : 0), total: s.total + 1 }))
  }

  return (
    <Section
      id="ae-combine"
      index="01 · 组合方式"
      title="加密 + 认证：顺序决定生死"
      subtitle="全或无分析：只要存在一个反例就算不安全。三种组合里只有先加密后认证（EtA）在所有情况下安全——思想一句话：让解密预言机失业，验证不过的密文直接 ⊥，CCA 实验就退化成了 CPA 实验。"
    >
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {combos.map((c) => (
          <Card
            key={c.name}
            className={cn(
              'border-border',
              c.flaw === null ? 'border-emerald-500/40 bg-emerald-500/5' : 'bg-card/60'
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-foreground">{c.name}</CardTitle>
                <span className="font-mono text-[10px] text-muted-foreground">{c.used}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <code className="block rounded bg-muted/60 px-2 py-1 font-mono text-[11px] text-orange-700 dark:text-orange-300">
                {c.formula}
              </code>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {c.flaw ?? '✓ 可证明：CPA 安全加密 + 安全 MAC ⇒ CCA 安全（AE）。'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Gavel className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              AtE 拆解游戏：一比特翻转预言机
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>Trans: 0→00, 1→01/10 · c = CTR(Trans(m‖Mac(m)))</Formula>
            <p className="text-xs leading-relaxed text-muted-foreground">
              挑战者藏了一个比特 m ∈ {'{0,1}'}。你把密文前两个比特都翻转后问解密预言机：
              若 m=1（01/10），翻转后是 10/01——仍是合法的 1，验证通过；
              若 m=0（00），翻转后是 11——非法编码，⊥。
              <span className="text-foreground">「密文是否有效」本身就值 1 个比特。</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={newChallenge} className="bg-orange-600 text-white hover:bg-orange-700">
                1 · 新挑战
              </Button>
              <Button variant="outline" className="border-border" onClick={doFlip} disabled={!ch}>
                2 · 翻转前两比特
              </Button>
              <Button variant="outline" className="border-border" onClick={askOracle} disabled={!flipped}>
                3 · 问解密预言机
              </Button>
            </div>
            {ch && (
              <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-muted-foreground">
                <div>挑战密文 c = [{ch.c.join(' ')}]</div>
                {flipped && <div>篡改后 c′ = [{flipped.join(' ')}]</div>}
                {oracleAns && (
                  <div
                    className={cn(
                      oracleAns === 'valid'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    预言机回答：{oracleAns === 'valid' ? '✓ 有效密文（m = 1 泄露）' : '⊥ 无效（m = 0 泄露）'}
                  </div>
                )}
              </div>
            )}
            {oracleAns && (
              <div className="flex items-center gap-2">
                <Button variant="outline" className="border-border" onClick={() => makeGuess(1)} disabled={guess !== null}>
                  猜 m = 1
                </Button>
                <Button variant="outline" className="border-border" onClick={() => makeGuess(0)} disabled={guess !== null}>
                  猜 m = 0
                </Button>
                {guess !== null && ch && (
                  <span
                    className={cn(
                      'font-mono text-sm',
                      guess === ch.m
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    )}
                  >
                    {guess === ch.m ? '✓ 又对（AtE 必败）' : '✗ 错了'} · m = {ch.m} · 胜率{' '}
                    {((score.wins / score.total) * 100).toFixed(0)}%（{score.wins}/{score.total}）
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Eye className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                E&A 的死法更直接：认证泄漏消息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                MAC 的定义只承诺「不可伪造」，<span className="text-foreground">从没承诺藏住消息</span>。
                看这个完全合法的 MAC：
              </p>
              <Formula>Mac′_k(m) = ( m, Mac_k(m) )</Formula>
              <Button variant="outline" className="border-border" onClick={() => setEaRevealed(!eaRevealed)}>
                {eaRevealed ? '收起' : '看看标签里有什么'}
              </Button>
              {eaRevealed && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 font-mono text-xs">
                  <div className="text-muted-foreground">m = "pay 100"</div>
                  <div className="text-red-700 dark:text-red-300">
                    t = ( "pay 100", 0x{hex2(toyMacByte(0x42, [1, 0, 0]))} )
                  </div>
                  <div className="mt-1 text-muted-foreground">← 明文就躺在标签里，Enc 白加密了</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                EtA 定理的证明骨架
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                <span className="text-foreground">解密先验标签</span>：
                Vrfy(c,t)=0 ⇒ ⊥，未认证密文永远拿不到解密结果。
              </p>
              <Formula>Pr[CCA成功] ≤ Pr[VQ] + Pr[成功 ∧ 无VQ]</Formula>
              <ul className="list-disc space-y-1 pl-5 text-xs">
                <li>
                  VQ（提交有效新密文）≈ 伪造 MAC：规约里 A_M 随机押注第 i 次查询，
                  Pr[Macforge] ≥ Pr[VQ]/q(n) ⇒ Pr[VQ] 可忽略；
                </li>
                <li>
                  无 VQ 时解密预言机只会说 ⊥，等于不存在——敌手退化为 CPA 敌手，胜率 ≤ 1/2 + 可忽略。
                </li>
              </ul>
              <p className="text-xs">
                加强版定理：MAC 满足唯一标签（强安全）时 EtA 给出完整的 AE。
                思考题留给你：CCA 安全 ⟹ AE 吗？（提示：Auth 实验还要求解密出新消息）
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Shuffle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                工业界的 AEAD 全家桶
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm leading-relaxed text-muted-foreground">
              <ul className="list-disc space-y-1 pl-5 text-xs">
                <li><span className="text-foreground">GCM</span>：CTR + Galois MAC（TLS/IPsec/SSH 现役主力）</li>
                <li><span className="text-foreground">EAX</span>：CTR + CMAC</li>
                <li><span className="text-foreground">CCM</span>：先 CBC-MAC 后 CTR（802.11i）——AtE 对这两模式恰好安全</li>
                <li><span className="text-foreground">OCB</span>：MAC 融进加密，比 CCM/EAX 快一倍</li>
              </ul>
              <p className="pt-1 text-xs">
                全部支持 AEAD：附加数据（如 IP 头）明文传输但参与认证——
                现实报文「部分要机密、整体要完整」的标准答案。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
