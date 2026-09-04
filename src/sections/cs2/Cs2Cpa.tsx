import { useMemo, useState } from 'react'
import { Anchor, Dices, Table2, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { prgStream, seedFromString } from '@/lib/prg'
import { bytesToHex, randomBytes, textToBytes, xorBytes } from '@/lib/otp'
import { Formula, Section } from '../shared'

export default function Cs2Cpa() {
  const [key, setKey] = useState('s3cret')
  const [msg, setMsg] = useState('midway')
  const [round, setRound] = useState(0)
  const [n, setN] = useState(8)

  // PRF 构造演示：同一明文，每次加密随机选 r ⇒ 密文不同
  const samples = useMemo(() => {
    const m = textToBytes(msg)
    return Array.from({ length: 3 }, () => {
      const r = bytesToHex(randomBytes(4)).replace(/ /g, '')
      const pad = prgStream(seedFromString(key + ':' + r), Math.max(m.length, 1))
      return { r, cipher: bytesToHex(xorBytes(m, pad)) }
    })
  }, [key, msg, round])

  // 查表规模：n·2ⁿ 比特；|Func_n| = 2^(n·2ⁿ)
  const tableBits = n * Math.pow(2, n)
  const tableStr =
    tableBits < 1e6 ? `${tableBits.toLocaleString()} 比特` : `${(tableBits / 8 / 1024).toExponential(1)} KB`

  return (
    <Section
      id="cs2-cpa"
      index="02 · CPA 安全"
      title="选择明文攻击与 PRF 构造"
      subtitle="敌手能让对方加密自己选择的内容？听起来过分强大——但中途岛海战中美军正是这么做的。要防住 CPA，需要新原语：伪随机函数。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 中途岛 + 预言机 */}
        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Anchor className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                中途岛的「淡水计」（1942）
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                美军密码分析员相信日军密文中的「AF」指中途岛，但高层不信。于是美军故意用明码发出
                <span className="text-foreground">「中途岛淡水供给不足」</span>
                ——日军截获后转发密电：「AF 淡水不足」。
              </p>
              <p>
                这就是一次教科书级的<span className="text-foreground">选择明文攻击</span>：
                美军选择了明文，并读到了它的密文。三艘航空母舰随后伏击得手。
              </p>
              <Formula>CPA：敌手可任意访问加密预言机 Encₖ(·)</Formula>
              <p className="text-xs">
                CPA 实验中敌手在选明文阶段和猜挑战密文阶段都能持续、适应性地查询预言机——
                比多重加密敌手（只能一次性看到一组密文）更强。定理：CPA 安全 ⇒ 多重加密安全。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Table2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                真随机函数有多大？
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                  <span>函数 {'{'}0,1{'}'}ⁿ → {'{'}0,1{'}'}ⁿ 的规模 n</span>
                  <span className="font-mono text-foreground">n = {n}</span>
                </div>
                <Slider value={[n]} onValueChange={([v]) => setN(v)} min={1} max={16} step={1} />
              </div>
              <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">查表存储</span>
                  <span className="text-foreground">n·2ⁿ = {tableStr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">函数族 |Funcₙ|</span>
                  <span className="text-foreground">2^({n}·2^{n})</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                真随机函数需要指数级存储，无法预先生成，只能 on-the-fly 模拟。
                PRF 是其中一个用 n 比特密钥就能索引的小子集——却与整个函数族不可区分。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* PRF 构造演示 */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Wand2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              PRF 构造 CPA 安全加密
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>Encₖ(m): 选随机 r，输出 ⟨r, Fₖ(r) ⊕ m⟩</Formula>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">密钥 k</label>
                <Input
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="border-input bg-background font-mono text-foreground"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">明文 m</label>
                <Input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="border-input bg-background font-mono text-foreground"
                />
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-violet-500/40 text-violet-700 hover:bg-violet-500/10 dark:text-violet-300"
              onClick={() => setRound((r) => r + 1)}
            >
              <Dices className="mr-1 h-4 w-4" /> 再加密三次
            </Button>
            <div className="space-y-2">
              {samples.map((s, i) => (
                <div key={i} className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
                  <div className="text-muted-foreground">
                    r = <span className="text-violet-700 dark:text-violet-300">{s.r}</span>
                  </div>
                  <div className="mt-1 break-all text-amber-700 dark:text-amber-300">{s.cipher}</div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-300">
              ✓ 同一明文每次加密都不同——随机化加密免疫了确定性攻击。定理：F 是 PRF ⇒ 该方案 CPA
              安全（把破解者规约成 PRF 区分器：预言机是真随机查表时，r 撞车概率 q(n)/2ⁿ
              可忽略，其余情形等价于一次一密）。
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
