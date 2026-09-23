import { useState } from 'react'
import { Disc3, HardDrive } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Formula, Section } from '../shared'
import { hex2, xexBlock, xtime } from '@/lib/ae'
import { toyPrp } from '@/lib/toycipher'
import { cn } from '@/lib/utils'

const K = 0x07
const SECTORS = 3
const BLOCKS = 4

const defaultDisk = () =>
  Array.from({ length: SECTORS }, (_, s) =>
    Array.from({ length: BLOCKS }, (_, j) => (s * 16 + j * 7 + 0x30) & 0xff)
  )

export default function AeDisk() {
  const [disk, setDisk] = useState<number[][]>(defaultDisk())
  const [sel, setSel] = useState<[number, number]>([1, 2])

  const editCell = (s: number, j: number) => {
    setSel([s, j])
    setDisk((d) => d.map((row, si) => row.map((v, ji) => (si === s && ji === j ? (v + 0x11) & 0xff : v))))
  }

  // 选中块的 tweak 链：x = F_k(I)，然后逐块乘 2
  const base = toyPrp(K ^ 0xa5).enc(sel[0] & 0xff)
  const chain: number[] = [base]
  for (let j = 1; j <= sel[1]; j++) chain.push(xtime(chain[j - 1]))
  const x = chain[sel[1]]

  return (
    <Section
      id="ae-disk"
      index="04 · 可调加密"
      title="XTS：磁盘加密的工业答案"
      subtitle="磁盘加密的硬约束：密文不能比明文长（扇区就地写回），所以是无完整性的确定性加密。给每个块一个一次性「tweak」，同一密钥下每个块都是不同的 PRP——XEX 模式，加上密文窃取（CTS）消除填充，就是 XTS（NIST SP 800-38E）。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <HardDrive className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              玩具磁盘：点击一个块改写它
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>c = F_k(m ⊕ x) ⊕ x · x = F_k(I) ⊗ 2ʲ（GF(2⁸)）</Formula>
            <div className="space-y-2">
              {disk.map((row, s) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="w-14 shrink-0 font-mono text-[10px] text-muted-foreground">
                    扇区 {s}
                  </span>
                  <div className="flex gap-1">
                    {row.map((v, j) => {
                      const c = xexBlock(K, s, j, v)
                      const selected = sel[0] === s && sel[1] === j
                      return (
                        <button
                          key={j}
                          onClick={() => editCell(s, j)}
                          className={cn(
                            'rounded border p-1.5 text-center font-mono text-[10px] transition-all',
                            selected
                              ? 'border-orange-500 bg-orange-500/15'
                              : 'border-border hover:border-orange-400'
                          )}
                        >
                          <div className="text-muted-foreground">m {hex2(v)}</div>
                          <div className="text-orange-700 dark:text-orange-300">c {hex2(c)}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              点一个块：它的明文 +0x11，<span className="text-foreground">只有它自己的密文变</span>
              ——无扩展、就地改写。注意两个扇区里相同的明文（如 0x30 开头）密文完全不同：
              tweak 把位置信息烙进了加密。
            </p>
            <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-muted-foreground">
              选中块（扇区 {sel[0]}，块 {sel[1]}）的 tweak：
              <div className="mt-1">
                F_k(I={sel[0]}) = 0x{hex2(base)}
                {chain.slice(1).map((v, i) => (
                  <span key={i}> →⊗2→ 0x{hex2(v)}</span>
                ))}
              </div>
              <div className="mt-1 text-orange-700 dark:text-orange-300">
                x = 0x{hex2(x)} · c = F_k(0x{hex2(disk[sel[0]][sel[1]])} ⊕ 0x{hex2(x)}) ⊕ 0x{hex2(x)}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Disc3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                tweak 与 IV 的区别
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                IV 要的是<span className="text-foreground">随机/不可预测</span>；
                tweak 要的是<span className="text-foreground">每块只用一次</span>——可预测无妨。
                扇区号 I 和块号 j 都是公开位置信息，天然就是现成的 tweak。
              </p>
              <p>
                朴素做法 k_t = F_k(t) 每块换一次密钥，要加密两次太慢；
                XEX 用 GF 域乘法 ⊗2ʲ 从一次 F_k(I) 廉价地派生整串 tweak。
              </p>
              <p className="text-xs">
                密文窃取（CTS）：最后一个不满块的块从倒数第二块「借」字节，
                长度零膨胀——磁盘扇区没有地方放填充。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="text-foreground">三个确定性方案横向对比</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2">方案</th>
                    <th className="pb-2">思路</th>
                    <th className="pb-2">完整性</th>
                    <th className="pb-2">代价</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2 text-foreground">SIV</td>
                    <td className="py-2">IV = F_k₁(m)</td>
                    <td className="py-2">SIV 兼作标签（DAE）</td>
                    <td className="py-2">两遍过消息</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 text-foreground">宽块 PRP</td>
                    <td className="py-2">Enc(m‖0^ℓ)，CMC/EME</td>
                    <td className="py-2">零冗余校验（DAE）</td>
                    <td className="py-2">两轮加密，慢 2×</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-foreground">XTS</td>
                    <td className="py-2">每块独立 tweak</td>
                    <td className="py-2">无（磁盘场景放弃）</td>
                    <td className="py-2">≈ 单轮 + GF 乘法</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
