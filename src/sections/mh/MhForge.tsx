import { useState } from 'react'
import { Hammer, KeyRound, Reply, Swords } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Formula, Section } from '../shared'
import { bytesToHex, wepForge, wepMac, wepVrfy, type WepTag } from '@/lib/machash'
import { cn } from '@/lib/utils'

const SECRET_K = 0x42 // 挑战者的密钥（敌手不可见）

const textToBytes = (s: string) => [...s].map((c) => c.charCodeAt(0) & 0xff)

export default function MhForge() {
  const [queryMsg, setQueryMsg] = useState('send $100 to Bob')
  const [forgeMsg, setForgeMsg] = useState('send $900 to Eve')
  const [queryTag, setQueryTag] = useState<WepTag | null>(null)
  const [forgedTag, setForgedTag] = useState<WepTag | null>(null)
  const [verdict, setVerdict] = useState<boolean | null>(null)

  const doQuery = () => {
    setQueryTag(wepMac(SECRET_K, textToBytes(queryMsg)))
    setForgedTag(null)
    setVerdict(null)
  }

  const doForge = () => {
    if (!queryTag) return
    setForgedTag(wepForge(textToBytes(queryMsg), queryTag, textToBytes(forgeMsg)))
    setVerdict(null)
  }

  const doSubmit = () => {
    if (!forgedTag) return
    setVerdict(wepVrfy(SECRET_K, textToBytes(forgeMsg), forgedTag))
  }

  return (
    <Section
      id="mh-forge"
      index="01 · 伪造攻击实操"
      title="Macforge 实验与 WEP 的 CRC32 灾难"
      subtitle="MAC 的安全定义一句话：敌手可以随意查询标签预言机，只要伪造不出「从未查询过的新消息」的有效标签就算安全。WEP 用 CRC32 当完整性校验——你来扮演敌手，一次查询就够伪造任意消息。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Swords className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              伪造游戏：tag = (r, F(k,r) ⊕ CRC32(m))
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>Macforge=1 ⟺ Vrfy(m,t)=1 ∧ m ∉ Q</Formula>

            <div className="space-y-2 rounded-lg border border-border p-3">
              <div className="text-xs font-medium text-muted-foreground">第 1 步 · 查询预言机</div>
              <div className="flex gap-2">
                <Input
                  value={queryMsg}
                  onChange={(e) => setQueryMsg(e.target.value)}
                  className="border-input bg-background font-mono text-sm text-foreground"
                />
                <Button variant="outline" className="border-border" onClick={doQuery}>
                  查询标签
                </Button>
              </div>
              {queryTag && (
                <div className="font-mono text-xs text-muted-foreground">
                  标签 = (r=0x{queryTag.r.toString(16).padStart(2, '0').toUpperCase()},{' '}
                  <span className="text-teal-700 dark:text-teal-300">{bytesToHex(queryTag.t)}</span>)
                </div>
              )}
            </div>

            <div className="space-y-2 rounded-lg border border-border p-3">
              <div className="text-xs font-medium text-muted-foreground">
                第 2 步 · 恢复密钥流 F(k,r) = t ⊕ CRC32(m)，为<span className="text-foreground">新消息</span>伪造
              </div>
              <div className="flex gap-2">
                <Input
                  value={forgeMsg}
                  onChange={(e) => setForgeMsg(e.target.value)}
                  className="border-input bg-background font-mono text-sm text-foreground"
                />
                <Button variant="outline" className="border-border" onClick={doForge} disabled={!queryTag}>
                  伪造标签
                </Button>
              </div>
              {forgedTag && (
                <div className="font-mono text-xs text-muted-foreground">
                  伪造标签 = (r=0x{forgedTag.r.toString(16).padStart(2, '0').toUpperCase()},{' '}
                  <span className="text-red-600 dark:text-red-400">{bytesToHex(forgedTag.t)}</span>)
                  <span className="ml-1">（与查询同 r，密钥流复用）</span>
                </div>
              )}
            </div>

            <Button
              onClick={doSubmit}
              disabled={!forgedTag}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              第 3 步 · 提交 (m, t) 给验证者
            </Button>
            {verdict !== null && (
              <div
                className={cn(
                  'rounded-lg border p-3 text-sm',
                  verdict
                    ? 'border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300'
                    : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                )}
              >
                {verdict
                  ? '✗ Vrfy = 1，伪造成功——WEP 式 MAC 不安全。新消息从未查询过，标签却有效。'
                  : '✓ Vrfy = 0，伪造被拦下。'}
              </div>
            )}

            <p className="text-xs leading-relaxed text-muted-foreground">
              关键：CRC32 是<span className="text-foreground">公开无密钥</span>的线性校验，
              t ⊕ CRC32(m) 就把密钥流抠了出来；同一 r 下可为任何消息生成有效标签。
              这是攻击 MAC 的第二种常用手法：用已知标签反推出构造新标签所需的全部信息。
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Hammer className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                攻击 MAC 的两种常用手法
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  <span className="text-foreground">撞中间结果</span>：找两条 CRC32 相同的消息
                  m、m′——CRC 是公开的，碰撞随手可造；查 m 的标签直接送给 m′。
                </li>
                <li>
                  <span className="text-foreground">抠构造信息</span>：从已有标签里恢复出密钥流等
                  中间材料，自己为新消息算标签——上面的游戏就是这条路线。
                </li>
              </ol>
              <p className="text-xs">
                伪造的分级：存在性（随便一条）⊂ 选择性（指定一条）⊂ 全域性（任意消息）。
                安全定义按最强标准：连存在性伪造都不能有。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Reply className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                重放攻击为什么不算伪造？
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>
                敌手把昨天截获的 (m, t) 原样再发一遍——标签当然有效，但 m
                <span className="text-foreground">不是新消息</span>，Macforge 实验不算赢。
              </p>
              <p>
                防御靠协议而非密码学：<span className="text-foreground">序列号</span>
                （收过的不收）或<span className="text-foreground">时间戳</span>（过期的不收）。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <KeyRound className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                MAC 在身边的三个应用
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <ul className="list-disc space-y-1 pl-5">
                <li>Web Cookie：服务器在 cookie 里塞 MAC 标签，阻止伪造他人身份。</li>
                <li>TCP SYN Cookie：初始序列号内嵌 MAC，服务器无状态防御 SYN Flooding。</li>
                <li>动态口令：p = Mac_k(T)，T 按半分钟取整——截获旧口令也无法伪造下一时段的。</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
