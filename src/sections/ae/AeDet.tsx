import { useState } from 'react'
import { Database, FileLock2, Repeat2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Formula, Section } from '../shared'
import { fixedIvEnc, fixedIvPredict, hex2, sivEncrypt } from '@/lib/ae'
import { cn } from '@/lib/utils'

const KE = 0x42
const FIXED_IV = 0x00
const K1 = 0x17
const K2 = 0x2b

const CANDIDATES = ['pay 100$', 'pay 900$']

const textToBytes = (s: string) => [...s].map((c) => c.charCodeAt(0) & 0xff)

export default function AeDet() {
  const [mode, setMode] = useState<'fixed' | 'siv'>('fixed')
  const [known, setKnown] = useState('pay 050$')
  const [cq1, setCq1] = useState<number[] | null>(null)
  const [cq2, setCq2] = useState<number[] | null>(null)
  const [testIdx, setTestIdx] = useState(0)
  const [verdict, setVerdict] = useState<boolean | null>(null)
  const [sivLog, setSivLog] = useState<{ m: string; siv: number; c: number[] }[]>([])

  const runFixedIv = () => {
    const t = (Math.random() < 0.5 ? 0 : 1) as 0 | 1
    setCq1(fixedIvEnc(KE, FIXED_IV, textToBytes(known)))
    setCq2(fixedIvEnc(KE, FIXED_IV, textToBytes(CANDIDATES[t])))
    setVerdict(null)
  }

  const lengthMismatch = known.length !== CANDIDATES[testIdx].length

  const testCandidate = () => {
    if (!cq1 || !cq2 || lengthMismatch) return
    const pred = fixedIvPredict(cq1, textToBytes(known), textToBytes(CANDIDATES[testIdx]))
    setVerdict(pred.every((b, i) => b === cq2[i]))
  }

  const runSiv = () => {
    const m = textToBytes(CANDIDATES[testIdx])
    const { siv, c } = sivEncrypt(K1, K2, m)
    setSivLog((l) => [...l.slice(-3), { m: CANDIDATES[testIdx], siv, c }])
  }

  return (
    <Section
      id="ae-det"
      index="03 · 确定性加密"
      title="固定 IV 是灾难，SIV 是正解"
      subtitle="加密数据库索引、磁盘扇区都要求密文与明文等长、同明文同密文——CPA 安全做不到（密文必须更长）。新定义：确定性 CPA 安全 = 同一 ⟨k,m⟩ 绝不加密两次。但「把 IV 钉死」不是答案，亲手拆给你看。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Repeat2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              攻防台：固定 IV vs SIV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(v) => {
                if (v) {
                  setMode(v as 'fixed' | 'siv')
                  setVerdict(null)
                  setCq2(null)
                }
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="fixed" className="border-border text-xs">
                错误示范：CTR + 固定 IV
              </ToggleGroupItem>
              <ToggleGroupItem value="siv" className="border-border text-xs">
                正解：SIV（IV = F_k₁(m)）
              </ToggleGroupItem>
            </ToggleGroup>

            {mode === 'fixed' ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  剧情：你往加密数据库里插了一条已知记录，又看到一条密文——
                  它是 "pay 100$" 还是 "pay 900$"？同一 IV ⇒ 同一条密钥流，异或关系直接给你答案。
                </p>
                <div className="flex items-end gap-2">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">你的已知明文 m_q1</label>
                    <Input value={known} onChange={(e) => setKnown(e.target.value)} className="w-32 border-input bg-background font-mono text-sm text-foreground" />
                  </div>
                  <Button onClick={runFixedIv} className="bg-orange-600 text-white hover:bg-orange-700">
                    1 · 查询 (m_q1, m_q2)
                  </Button>
                </div>
                {cq1 && cq2 && (
                  <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
                    <div className="text-muted-foreground">
                      c_q1 = [{cq1.map(hex2).join(' ')}]（你已知明文）
                    </div>
                    <div className="text-muted-foreground">
                      c_q2 = [{cq2.map(hex2).join(' ')}]（目标密文）
                    </div>
                    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2">
                      <span className="text-muted-foreground">2 · 预测哪个候选？</span>
                      {CANDIDATES.map((cand, i) => (
                        <Button
                          key={cand}
                          variant="outline"
                          className={cn('h-7 border-border px-2 font-mono text-xs', testIdx === i && 'border-orange-500 text-orange-700 dark:text-orange-300')}
                          onClick={() => {
                            setTestIdx(i)
                            setVerdict(null)
                          }}
                        >
                          {cand}
                        </Button>
                      ))}
                      <Button variant="outline" className="h-7 border-border text-xs" onClick={testCandidate} disabled={lengthMismatch}>
                        计算 c* = m* ⊕ (c_q1 ⊕ m_q1) 并比对
                      </Button>
                      {lengthMismatch && (
                        <span className="text-[10px] text-red-600 dark:text-red-400">
                          m_q1 与候选需等长（当前 {known.length} vs {CANDIDATES[testIdx].length} 字符）
                        </span>
                      )}
                    </div>
                    {verdict !== null && (
                      <div className={verdict ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}>
                        {verdict
                          ? `✗ c* 与 c_q2 逐字节相同 ⇒ m_q2 = "${CANDIDATES[testIdx]}"——固定 IV 下被完全读出`
                          : '不是这个候选——换一个试试（总有一个命中）'}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  SIV：IV 不再乱选也不固定，而是<span className="text-foreground">由消息经 PRF 合成</span>：
                  SIV = F_k₁(m)，c = ⟨SIV, CTR_k₂(SIV, m)⟩。同消息同密文（可索引），
                  但敌手无法预测未查询消息的 IV。多点几次同一候选——密文稳定；换个候选——全变。
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {CANDIDATES.map((cand, i) => (
                    <Button
                      key={cand}
                      variant="outline"
                      className={cn('h-8 border-border font-mono text-xs', testIdx === i && 'border-orange-500 text-orange-700 dark:text-orange-300')}
                      onClick={() => setTestIdx(i)}
                    >
                      {cand}
                    </Button>
                  ))}
                  <Button onClick={runSiv} className="bg-orange-600 text-white hover:bg-orange-700">
                    SIV 加密
                  </Button>
                </div>
                {sivLog.length > 0 && (
                  <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
                    {sivLog.map((e, i) => (
                      <div key={i} className="text-muted-foreground">
                        "{e.m}" → SIV=0x{hex2(e.siv)} · c=[{e.c.map(hex2).join(' ')}]
                        {i > 0 && sivLog[i - 1].m === e.m && (
                          <span className="ml-1 text-orange-600 dark:text-orange-400">（与上一条逐字节相同 ✓ 确定性）</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  SIV-CTR 还能当 DAE：把 SIV 本身当 MAC 标签。RFC 5297 即此构造。
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Database className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                确定性 CPA 安全：定义先让步
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                确定性 ⟹ 同 ⟨k,m⟩ 同密文 ⟹ 敌手一查就知道「这条见过」——
                所以经典 CPA 不可能。让步后的定义：
                <span className="text-foreground">密钥与消息对 ⟨k,m⟩ 唯一</span>时要求 CPA 级别不可区分。
              </p>
              <Formula>PRP 本身就是定长确定性 CPA 安全加密</Formula>
              <p className="text-xs">
                变长怎么办？三条路线：SIV（本页）· 宽块 PRP（下一节）· 可调加密 XTS（下一节）。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileLock2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                宽块 PRP：把整块消息当一个块
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <Formula>Enc_k(m ‖ 0^ℓ) · 解密后 ℓ 位 ≠ 0 ⇒ ⊥</Formula>
              <p>
                用 AES 这类窄块 PRP 造一个和消息一样大的宽块 PRP（IEEE P1619.2：
                CMC = CBC-mask-CBC，EME = ECB-mask-ECB），末尾零冗余充当完整性校验——
                这就是 PRP-based DAE。代价：两轮加密，比 SIV 慢一倍。
              </p>
              <p className="text-xs">
                为什么必须宽块？窄块下相同明文块产生相同密文块，分块粒度的模式照样泄漏
                （回忆第四讲的 ECB 企鹅）。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
