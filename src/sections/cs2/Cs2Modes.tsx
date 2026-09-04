import { useEffect, useMemo, useRef, useState } from 'react'
import { Dices, Grid3X3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  cbcEncrypt,
  ctrEncrypt,
  ecbEncrypt,
  penguinBitmap,
  pixelPrp,
  PIX,
} from '@/lib/toycipher'
import { Section } from '../shared'
import { cn } from '@/lib/utils'

const PALETTE = ['#bae6fd', '#fafafa', '#3f3f46', '#f97316'] // 背景/肚皮/身体/眼睛

function Bitmap({ px }: { px: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    px.forEach((v, i) => {
      ctx.fillStyle = PALETTE[v]
      ctx.fillRect(i % PIX, Math.floor(i / PIX), 1, 1)
    })
  }, [px])
  return (
    <canvas
      ref={ref}
      width={PIX}
      height={PIX}
      className="w-full rounded-lg border border-border"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

const MODES = [
  { name: 'ECB', cpa: false, parallel: '加密可并行', note: '确定性 ⇒ 连窃听安全都谈不上' },
  { name: 'CBC', cpa: true, parallel: '加密不可并行', note: '需随机不可预测 IV；F 必须是 PRP（要解密）' },
  { name: 'CTR', cpa: true, parallel: '加解密都可并行', note: 'F 只需是 PRF；ctr 逐块递增' },
] as const

export default function Cs2Modes() {
  const [seed, setSeed] = useState(7)
  const [iv, setIv] = useState(2)

  const orig = useMemo(() => penguinBitmap(), [])
  const prp = useMemo(() => pixelPrp(seed), [seed])
  const ecb = useMemo(() => ecbEncrypt(orig, prp), [orig, prp])
  const cbc = useMemo(() => cbcEncrypt(orig, prp, iv), [orig, prp, iv])
  const ctr = useMemo(() => ctrEncrypt(orig, seed, iv), [orig, seed, iv])

  const grids = [
    { title: '原图', px: orig, bad: false },
    { title: 'ECB 加密后', px: ecb, bad: true },
    { title: 'CBC 加密后', px: cbc, bad: false },
    { title: 'CTR 加密后', px: ctr, bad: false },
  ]

  return (
    <Section
      id="cs2-modes"
      index="03 · 操作模式"
      title="ECB 企鹅：操作模式实验"
      subtitle="把消息分块，用 PRF/PRP 逐块处理——就是操作模式。同样的密钥、同样的图，四种处理结果天差地别。这只企鹅是密码学最著名的吉祥物。"
    >
      <Card className="border-border bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground">
            <span className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              像素级加密对比（分组 = 1 像素，值域 {'{'}0,1,2,3{'}'}）
            </span>
            <Button
              size="sm"
              variant="outline"
              className="border-violet-500/40 text-violet-700 hover:bg-violet-500/10 dark:text-violet-300"
              onClick={() => {
                setSeed(Math.floor(Math.random() * 1e9))
                setIv(Math.floor(Math.random() * 4))
              }}
            >
              <Dices className="mr-1 h-4 w-4" /> 换密钥和 IV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {grids.map((g) => (
              <div key={g.title}>
                <Bitmap px={g.px} />
                <div
                  className={cn(
                    'mt-2 text-center text-xs font-medium',
                    g.bad ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                  )}
                >
                  {g.title}
                  {g.bad && ' ⚠ 企鹅原形毕露'}
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">模式</th>
                  <th className="px-4 py-2 text-left">CPA 安全？</th>
                  <th className="px-4 py-2 text-left">并行</th>
                  <th className="px-4 py-2 text-left">备注</th>
                </tr>
              </thead>
              <tbody>
                {MODES.map((m) => (
                  <tr key={m.name} className="border-t border-border/60">
                    <td className="px-4 py-2 font-mono font-semibold text-foreground">{m.name}</td>
                    <td className="px-4 py-2">
                      {m.cpa ? (
                        <span className="text-emerald-600 dark:text-emerald-400">✓（IV 随机时）</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">✗ 相同明文块 ⇒ 相同密文块</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{m.parallel}</td>
                    <td className="px-4 py-2 text-muted-foreground">{m.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            ECB 逐块独立加密：等值的像素块永远映射成等值密文块，轮廓原样保留——确定性加密的死刑在图像上格外醒目。
            CBC/CTR 引入随机 IV/ctr，每次加密结果都不同。另注意 CTR 安全定理的关键：
            预言机查询与挑战密文的 ctr 序列重叠概率 ≤ 2q(n)²/2ⁿ，可忽略。
            <span className="text-foreground"> IV 绝不可预测</span>
            ——SSL/TLS 1.0 用上一个记录的密文块当 IV，正是这个漏洞。
          </p>
        </CardContent>
      </Card>
    </Section>
  )
}
