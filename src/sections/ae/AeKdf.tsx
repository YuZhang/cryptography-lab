import { useMemo, useState } from 'react'
import { Layers, Turtle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Formula, Section } from '../shared'
import { hex2, hkdfExtract, kdfExpand, pbkdf } from '@/lib/ae'

const DICT_SIZE = 10000 // 攻击者字典：1 万个常见口令
const HASH_US = 1 // 玩具假设：单次哈希 1 微秒（真实 SHA-256 同理量级）

export default function AeKdf() {
  const [salt, setSalt] = useState(0x2a)
  const [ctx, setCtx] = useState(0x05)
  const [iterLog, setIterLog] = useState(2) // log10(c)

  const sk = 0x9d // 主秘密（演示固定）

  // 均匀情形：直接 PRF 计数器扩展
  const uniformKeys = useMemo(() => kdfExpand(sk, ctx, 4), [ctx])

  // 非均匀情形：HKDF 先提取再扩展
  const extracted = useMemo(() => hkdfExtract(salt, sk), [salt])
  const hkdfKeys = useMemo(() => kdfExpand(extracted, ctx, 4), [extracted, ctx])

  // PBKDF：口令延展
  const c = 10 ** iterLog
  const pwd = 0x3f
  const derived = useMemo(() => pbkdf(pwd, salt, c), [salt, c])
  const attackSec = (DICT_SIZE * c * HASH_US) / 1e6
  const fmtTime = (s: number) =>
    s < 60 ? `${s.toFixed(2)} 秒` : s < 3600 ? `${(s / 60).toFixed(1)} 分钟` : `${(s / 3600).toFixed(1)} 小时`

  return (
    <Section
      id="ae-kdf"
      index="05 · 密钥派生"
      title="KDF：一个秘密，长出一片钥匙串"
      subtitle="主密钥只有一个，用途却有很多（加密、认证、不同会话、不同应用）——每把子密钥都必须独立。原密钥均匀随机时直接计数器扩展；口令这类「不匀」的秘密要先提取再拉伸。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Layers className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              提取-扩展范式（HKDF 玩具版）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>KDF(sk, ctx, l) = ⟨F_sk(ctx‖0), …, F_sk(ctx‖l−1)⟩</Formula>
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                应用标识 ctx = 0x{hex2(ctx)}（不同应用用不同 ctx）
              </label>
              <Slider value={[ctx]} min={1} max={16} step={1} onValueChange={([v]) => setCtx(v)} />
            </div>
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                盐 salt = 0x{hex2(salt)}（提取时加熵）
              </label>
              <Slider value={[salt]} min={1} max={255} step={7} onValueChange={([v]) => setSalt(v)} />
            </div>
            <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
              <div className="text-muted-foreground">
                提取：k = H(salt ‖ sk) = <span className="text-foreground">0x{hex2(extracted)}</span>
              </div>
              <div className="text-muted-foreground">扩展（ctx = 0x{hex2(ctx)}）：</div>
              {hkdfKeys.map((k, i) => (
                <div key={i} className="pl-3 text-muted-foreground">
                  F_k(ctx‖{i}) = <span className="text-orange-700 dark:text-orange-300">0x{hex2(k)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-1 text-[10px]">
                对照·sk 均匀时无需提取：{uniformKeys.map((k) => '0x' + hex2(k)).join(' ')}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              拖动 salt/ctx 看子密钥整体改换：每对 (salt, ctx) 对应一簇独立密钥。
              提取把不均匀的输入「浓缩」成均匀密钥；扩展再按需量产。
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Turtle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              PBKDF：口令要加盐，还要够慢
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>PKCS#5：H⁽ᶜ⁾(pwd ‖ salt) —— 迭代 c 次</Formula>
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">
                迭代次数 c = 10^{iterLog} = {c.toLocaleString()}
              </label>
              <Slider value={[iterLog]} min={0} max={5} step={1} onValueChange={([v]) => setIterLog(v)} />
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-muted-foreground">
              派生密钥 = <span className="text-orange-700 dark:text-orange-300">0x{hex2(derived)}</span>
              <span className="ml-1">（salt=0x{hex2(salt)}）</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs text-muted-foreground">
                <span>合法用户登录一次</span>
                <span>{fmtTime((c * HASH_US) / 1e6)}</span>
              </div>
              <div className="flex justify-between font-mono text-xs text-muted-foreground">
                <span>攻击者跑 {DICT_SIZE.toLocaleString()} 个口令字典</span>
                <span className="text-red-600 dark:text-red-400">{fmtTime(attackSec)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded bg-muted">
                <div
                  className="h-full bg-orange-500/70 transition-all"
                  style={{ width: `${(iterLog / 5) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="text-foreground">密钥延展</span>（迭代）让每次猜测变贵 c 倍——
              用户只付一次，攻击者付一万次；<span className="text-foreground">密钥加强</span>
              （加盐）让彩虹表作废，还把同一口令映射成不同密钥。
              攻击者只剩两条路：啃加强后的大密钥空间，或逐口令付迭代税。
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
