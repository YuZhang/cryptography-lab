import { useState } from 'react'
import { AlertTriangle, PackageOpen, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Section } from '../shared'
import { sshNewTarget, sshSendPacket, type SshState } from '@/lib/ae'
import { cn } from '@/lib/utils'

export default function AeImpl() {
  const [st, setSt] = useState<SshState | null>(null)
  const [guess, setGuess] = useState<number | null>(null)

  const send = () => st && setSt(sshSendPacket(st))

  return (
    <Section
      id="ae-impl"
      index="02 · 实现摧毁理论"
      title="纸面安全 ≠ 系统安全"
      subtitle="即使组合方式正确（EtA），实现的细节也能把一切葬送。两个名场面：TLS 1.0 把填充错误和 MAC 错误分开报告（第四讲的填充预言机）；SSH 二进制包协议边解密边读包——长度字段先出来，MAC 最后才验。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <PackageOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              SSH 非原子解密模拟器
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              服务器收到你发的密文 c 后分三步走：
              <span className="text-foreground">① 解密出长度 l → ② 读满 l 个包 → ③ 才检查 MAC</span>。
              你不断塞垃圾包，服务器一直收；收满 l 个的瞬间 MAC 报错——
              报错前的包数就是 Dec(c)。明文被「数」出来了。
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setSt(sshNewTarget())
                  setGuess(null)
                }}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                新密文 c（隐藏 l ∈ 1..8）
              </Button>
              <Button
                variant="outline"
                className="border-border"
                onClick={send}
                disabled={!st || st.macError}
              >
                <Send className="mr-1 h-3 w-3" /> 塞一个包
              </Button>
            </div>
            {st && (
              <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
                <div className="flex gap-1">
                  {Array.from({ length: Math.max(8, st.sent) }, (_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded border font-mono text-[10px]',
                        i < st.sent
                          ? st.macError && i === st.sent - 1
                            ? 'border-red-500/60 bg-red-500/20 text-red-700 dark:text-red-300'
                            : 'border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300'
                          : 'border-border/50 text-muted-foreground/40'
                      )}
                    >
                      {i < st.sent ? '✉' : i + 1}
                    </span>
                  ))}
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {st.macError ? (
                    <span className="text-red-600 dark:text-red-400">
                      MAC error！服务器共收下 {st.sent} 个包才报错 ⇒ Dec(c) = {st.sent}
                    </span>
                  ) : (
                    `服务器静默接收中…已收 ${st.sent} 个包`
                  )}
                </div>
              </div>
            )}
            {st?.macError && guess === null && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">你推出 l =</span>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((v) => (
                  <Button
                    key={v}
                    variant="outline"
                    className="h-7 border-border px-2 font-mono text-xs"
                    onClick={() => setGuess(v)}
                  >
                    {v}
                  </Button>
                ))}
              </div>
            )}
            {guess !== null && st && (
              <div
                className={cn(
                  'rounded-lg border p-3 text-sm',
                  guess === st.plaintext
                    ? 'border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300'
                    : 'border-border text-muted-foreground'
                )}
              >
                {guess === st.plaintext
                  ? `✓ 正是 ${st.plaintext}——不解密、不知密钥，明文长度值被完整读出`
                  : `✗ 再数数（你猜 ${guess}，实际收包数就是答案）`}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-red-500/30 bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" /> 为什么这叫「非原子」问题
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>
                原子解密应该是：整段密文进来 → 验 MAC → 过了才解密 → 一次性输出。
                SSH BPP 把它拆成了三步，每一步都向外界泄露中间状态（读包行为本身就是预言机）。
              </p>
              <p>
                TLS 1.0 同理：「padding error」和「MAC error」两种报错，
                等于免费送了填充预言机——第四讲你已经用它逐字节恢复过明文。
              </p>
              <p className="text-xs font-medium text-red-700 dark:text-red-300">
                共同教训：验证必须先于一切对外可见的行为；错误信息必须无差别。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">还有一条暗坑：别复用密钥</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              加密和认证必须用<span className="text-foreground">不同的密钥</span> k₁ ≠ k₂。
              反例一句话：若 Mac_k(c) = Dec_k(c)，标签直接就是解密结果——
              机密性和真实性互相拆台。用 KDF 从一个主密钥派生两把是标准做法（见本讲末节）。
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
