import { useState } from 'react'
import { Layers, Timer, Unplug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Formula, Section } from '../shared'
import { hex2, prefixKeyMac, toyHmac, toyMdExtend } from '@/lib/machash'
import { cn } from '@/lib/utils'

const K1 = 0x5a
const K2 = 0x33

const textToBytes = (s: string) => [...s].map((c) => c.charCodeAt(0) & 0xff)

// ── 计时攻击模拟 ──

interface TimingState {
  tag: number[]
  recovered: number[]
  queries: number
  done: boolean
}

function newTimingTarget(): TimingState {
  const tag = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256))
  return { tag, recovered: [], queries: 0, done: false }
}

/** 模拟一次早期退出比较：返回匹配前缀长度（响应时间 ∝ 它） */
function earlyExitMatch(tag: number[], guess: number[]): number {
  let i = 0
  while (i < tag.length && i < guess.length && tag[i] === guess[i]) i++
  return i
}

export default function MhHmac() {
  const [msg, setMsg] = useState('abc')
  const [extra, setExtra] = useState('!!')
  const [mode, setMode] = useState<'prefix' | 'hmac'>('prefix')
  const [issued, setIssued] = useState<number | null>(null)
  const [verdict, setVerdict] = useState<boolean | null>(null)

  const issue = () => {
    const m = textToBytes(msg)
    setIssued(mode === 'prefix' ? prefixKeyMac(K1, m) : toyHmac(K1, K2, m))
    setVerdict(null)
  }

  const attack = () => {
    if (issued === null) return
    const forgedTag = toyMdExtend(issued, textToBytes(extra)) // 从 t 继续压缩，不需要 k
    const realTag =
      mode === 'prefix'
        ? prefixKeyMac(K1, [...textToBytes(msg), ...textToBytes(extra)])
        : toyHmac(K1, K2, [...textToBytes(msg), ...textToBytes(extra)])
    setVerdict(forgedTag === realTag)
  }

  // 计时攻击
  const [timing, setTiming] = useState<TimingState | null>(null)

  const runTiming = () => {
    const st = newTimingTarget()
    let queries = 0
    const recovered: number[] = []
    for (let pos = 0; pos < 4; pos++) {
      let bestByte = 0
      let bestTime = -1
      for (let v = 0; v < 256; v++) {
        queries++
        const t = earlyExitMatch(st.tag, [...recovered, v])
        if (t > bestTime) {
          bestTime = t
          bestByte = v
        }
      }
      recovered.push(bestByte)
    }
    setTiming({ ...st, recovered, queries, done: true })
  }

  return (
    <Section
      id="mh-hmac"
      index="04 · Hash-and-MAC"
      title="长度扩展攻击与 HMAC"
      subtitle="有了 CRHF，最直接的 MAC 是 H(k‖m)——密钥前缀哈希。Merkle-Damgård 结构让它死得很难看：标签就是内部状态，谁都能接着往下算。HMAC 用两层包裹封死这个口子，成为工业标准（RFC2104）。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Unplug className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              长度扩展攻击实操（玩具 MD 哈希）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(v) => {
                if (v) {
                  setMode(v as 'prefix' | 'hmac')
                  setIssued(null)
                  setVerdict(null)
                }
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="prefix" className="border-border text-xs">
                不安全：t = H(k‖m)
              </ToggleGroupItem>
              <ToggleGroupItem value="hmac" className="border-border text-xs">
                HMAC：t = H(k₂‖H(k₁‖m))
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">消息 m</label>
                <Input
                  value={msg}
                  onChange={(e) => {
                    setMsg(e.target.value)
                    setIssued(null)
                    setVerdict(null)
                  }}
                  className="border-input bg-background font-mono text-foreground"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">追加内容 x′</label>
                <Input
                  value={extra}
                  onChange={(e) => {
                    setExtra(e.target.value)
                    setVerdict(null)
                  }}
                  className="border-input bg-background font-mono text-foreground"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="border-border" onClick={issue}>
                1 · 查询 m 的标签
              </Button>
              <Button
                onClick={attack}
                disabled={issued === null}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                2 · 从 t 接着算，伪造 m‖x′
              </Button>
            </div>

            {issued !== null && (
              <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-muted-foreground">
                <div>
                  服务器发出标签 t = <span className="text-foreground">0x{hex2(issued)}</span>
                  <span className="ml-1">（这就是哈希链的内部终态）</span>
                </div>
                <div>
                  你接着算：z ← t，逐块压缩 x′ ⇒ 伪造标签，全程不知道 k
                </div>
                {verdict !== null && (
                  <div
                    className={cn(
                      'border-t border-border pt-2',
                      verdict
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    )}
                  >
                    {verdict
                      ? '✗ 伪造标签通过验证——H(k‖m) 存在长度扩展攻击'
                      : '✓ 攻击失败：HMAC 的外层哈希把内部状态包住了，你拿不到可延长的状态'}
                  </div>
                )}
              </div>
            )}

            <p className="text-xs leading-relaxed text-muted-foreground">
              MD 结构的命门：输出 = 最后一跳的链接值。前缀密钥把它直接交了出去。
              历史上 H(x‖k) 怕弱哈希碰撞、H(k‖x‖k) 也有已知弱点——唯有
              H(k‖H(k‖x))（NMAC/HMAC 路线）经受住了分析。
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Layers className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                HMAC 的双重包裹
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <Formula>t = H((k⊕opad) ‖ H((k⊕ipad) ‖ m))</Formula>
              <p>
                内层哈希混淆消息，外层哈希封死状态。安全性归约为：
                G(k) = h(IV‖k⊕opad) ‖ h(IV‖k⊕ipad) 若可视为 PRG，则 HMAC 安全。
                不需要修改现成哈希实现——这是它击败 NMAC 成为标准的关键工程优势。
              </p>
              <p className="text-xs">
                还有 Hash-and-MAC 路线：F_k(H(m))——哈希撞了算 CRHF 的锅，
                标签伪造算 PRF 的锅，责任划分干净利落。
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-500/30 bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Timer className="h-5 w-5" /> 真实事故：验证里的计时旁路
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Keyczar 库的验证是 <code className="font-mono text-xs">HMAC(k,m) == sig</code>
                ——按字节比较，逐字节早退。响应时间泄露了「前多少字节正确」，
                敌手逐字节猜出整个标签。Xbox 360 上相邻字节的拒绝时差达 2.2 毫秒。
              </p>
              <div className="rounded-lg border border-border bg-card/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">模拟：4 字节标签，逐字节爆破</span>
                  <Button variant="outline" className="h-7 border-border text-xs" onClick={runTiming}>
                    发起计时攻击
                  </Button>
                </div>
                {timing && (
                  <div className="space-y-1 font-mono text-xs">
                    <div className="text-muted-foreground">
                      真实标签：<span className="text-foreground">{timing.tag.map(hex2).join(' ')}</span>
                    </div>
                    <div className="text-muted-foreground">
                      恢复结果：
                      <span className="text-red-600 dark:text-red-400">
                        {timing.recovered.map(hex2).join(' ')}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      查询 {timing.queries} 次（≤ 4×256）· 蛮力需 2³² ≈ 43 亿次
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-red-700 dark:text-red-300">
                教训：不要自己实现密码学——验证必须常数时间比较。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
