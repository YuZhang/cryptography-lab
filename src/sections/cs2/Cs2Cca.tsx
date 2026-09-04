import { useMemo, useState } from 'react'
import { Hammer, ServerCog, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  BLOCK,
  cbcEncryptBlock,
  paddingOracleAttack,
  pkcsPad,
  toyPrp,
  type AttackLog,
} from '@/lib/toycipher'
import { prgStream } from '@/lib/prg'
import { bytesToHex, bytesToText, randomBytes, textToBytes, xorBytes } from '@/lib/otp'
import { Formula, Section } from '../shared'
import { cn } from '@/lib/utils'

export default function Cs2Cca() {
  // ── 演示一：比特翻转锻造 ──
  // PRF 方案：c = ⟨r, s⟩，s = Fₖ(r) ⊕ m；翻转 s 的第 i 字节 ⇔ 解密出的 m′ 第 i 字节同步翻转
  const [malMsg, setMalMsg] = useState('pay=100')
  const [flipPos, setFlipPos] = useState(4)
  const malBytes = useMemo(() => textToBytes(malMsg), [malMsg])
  const sBytes = useMemo(
    () => xorBytes(malBytes, prgStream(0xc0ffee, Math.max(malBytes.length, 1))),
    [malBytes]
  )
  const forged = useMemo(() => {
    const s = [...sBytes]
    if (flipPos < s.length) s[flipPos] ^= 0x01
    return xorBytes(s, prgStream(0xc0ffee, Math.max(s.length, 1)))
  }, [sBytes, flipPos])

  // ── 演示二：填充预言机攻击 ──
  const [poMsg, setPoMsg] = useState('midway!')
  const [attack, setAttack] = useState<{
    plaintext: number[]
    logs: AttackLog[]
    totalQueries: number
  } | null>(null)

  const po = useMemo(() => {
    const prp = toyPrp(0xdeadbeef)
    const iv = randomBytes(BLOCK)
    const msg = textToBytes(poMsg).slice(0, BLOCK - 1)
    const padded = pkcsPad(msg)
    const c = cbcEncryptBlock(prp, iv, padded)
    return { prp, iv, c, padded }
  }, [poMsg])

  function runAttack() {
    setAttack(paddingOracleAttack(po.prp, po.iv, po.c))
  }

  const validPo = poMsg.length >= 1 && poMsg.length <= BLOCK - 1

  return (
    <Section
      id="cs2-cca"
      index="04 · CCA 安全"
      title="选择密文攻击与填充预言机"
      subtitle="敌手的终极形态：能篡改密文并观察解密结果。CCA 安全等价于「不可锻造性」——此前所有方案都不满足，而 2002 年的填充预言机攻击用一个「坏填充错误」提示就拆掉了整条 TLS 信道。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 比特翻转 */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Wrench className="h-5 w-5 text-red-600 dark:text-red-400" />
              锻造演示：翻转一个比特
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>c = ⟨r, Fₖ(r) ⊕ m⟩， 改 c 的一位 ⇒ 解密出的 m′ 恰好变一位</Formula>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">明文 m</label>
              <Input
                value={malMsg}
                onChange={(e) => {
                  setMalMsg(e.target.value)
                  setFlipPos(0)
                }}
                className="border-input bg-background font-mono text-foreground"
              />
            </div>
            <div>
              <div className="mb-2 text-xs text-muted-foreground">
                密文 s = Fₖ(r) ⊕ m（hex），点击一个字节翻转其最低位：
              </div>
              <div className="flex flex-wrap gap-1">
                {sBytes.map((b, i) => (
                  <button
                    key={i}
                    onClick={() => setFlipPos(i)}
                    className={cn(
                      'rounded border px-2 py-1 font-mono text-xs transition-colors',
                      i === flipPos
                        ? 'border-red-500 bg-red-500/15 text-red-600 dark:text-red-400'
                        : 'border-border text-muted-foreground hover:border-red-500/40'
                    )}
                  >
                    {b.toString(16).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-sm">
              <div className="text-muted-foreground">原明文： {malMsg}</div>
              <div className="mt-1">
                解密出：
                {forged.map((b, i) => (
                  <span
                    key={i}
                    className={cn(
                      i === flipPos
                        ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                        : 'text-foreground'
                    )}
                  >
                    {String.fromCharCode(b)}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              密文可被精确地「改变但不毁坏」——这就是 malleability（可锻造性）。
              CCA 敌手的标准策略：修改挑战密文 c → c′，查解密预言机得 m′，由关系推出 m_b。
              所以 CPA 安全的 PRF 方案、以及全部操作模式，都不是 CCA 安全的。
            </p>
          </CardContent>
        </Card>

        {/* 填充预言机 */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <ServerCog className="h-5 w-5 text-red-600 dark:text-red-400" />
              填充预言机攻击实操（CBC + PKCS 填充）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                秘密消息（1–{BLOCK - 1} 字符，你是敌手，看不见它）
              </label>
              <Input
                value={poMsg}
                onChange={(e) => {
                  setPoMsg(e.target.value)
                  setAttack(null)
                }}
                className="border-input bg-background font-mono text-foreground"
              />
              {!validPo && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">长度需为 1–{BLOCK - 1}</p>
              )}
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="text-muted-foreground">
                IV = <span className="text-foreground">{bytesToHex(po.iv)}</span>
              </div>
              <div className="text-muted-foreground">
                C₁ = <span className="text-amber-700 dark:text-amber-300">{bytesToHex(po.c)}</span>
              </div>
              <div className="text-muted-foreground">
                预言机：修改 IV 后解密，只回答「填充 有效 / 无效」
              </div>
            </div>
            <Button
              size="sm"
              disabled={!validPo}
              onClick={runAttack}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Hammer className="mr-1 h-4 w-4" /> 发动攻击
            </Button>

            {attack && (
              <div className="space-y-3">
                <div className="max-h-40 overflow-y-auto rounded-lg border border-border">
                  <table className="w-full font-mono text-xs">
                    <thead className="sticky top-0 bg-card text-muted-foreground">
                      <tr>
                        <th className="px-3 py-1.5 text-left">字节位置</th>
                        <th className="px-3 py-1.5 text-left">猜测次数</th>
                        <th className="px-3 py-1.5 text-left">恢复字节</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attack.logs.map((l) => (
                        <tr key={l.pos} className="border-t border-border/60">
                          <td className="px-3 py-1 text-muted-foreground">#{l.pos}</td>
                          <td className="px-3 py-1 text-muted-foreground">{l.queries}</td>
                          <td className="px-3 py-1 text-red-600 dark:text-red-400">
                            0x{l.recovered.toString(16).padStart(2, '0')}（
                            {l.recovered >= 32 && l.recovered < 127
                              ? String.fromCharCode(l.recovered)
                              : '·'}
                            ）
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm">
                  <div className="font-mono text-red-700 dark:text-red-300">
                    恢复出明文："{bytesToText(attack.plaintext.slice(0, textToBytes(poMsg).length))}"
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    共查询预言机 {attack.totalQueries} 次（每字节至多 256 次猜测）——
                    仅凭 1 比特的「填充是否有效」提示，整条消息被逐字节榨出。
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              真实案例：CAPTCHA 服务商与网站共享密钥，用户转发密文给 CAPTCHA 服务器解密——
              服务器返回的「坏填充错误」就是预言机。教训：解密失败信息也是信息泄露，
              加密必须配合认证（Encrypt-then-MAC）才是 CCA 安全的。
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
