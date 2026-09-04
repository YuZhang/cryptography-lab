import { useState } from 'react'
import { Crown, History, ListChecks, Landmark } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Section } from '../shared'
import { cn } from '@/lib/utils'

interface Event {
  year: string
  text: string
  crack?: { label: string; seconds: number }
}

const timeline: Event[] = [
  { year: '1973', text: 'NBS（NIST 前身）发布加密标准召集公告' },
  { year: '1974', text: 'DES 在联邦政府公告发布' },
  { year: '1977', text: 'DES 成为联邦标准 FIPS PUB 46' },
  { year: '1990', text: '差分分析公开：2⁴⁷ 个选择明文可破 DES', crack: { label: '理论攻击', seconds: Infinity } },
  { year: '1997', text: 'DESCHALL 项目用互联网众包算力首次公开破解 DES', crack: { label: '约 96 天', seconds: 8.3e6 } },
  { year: '1998', text: 'EFF 的 Deep Crack：$250,000 专用机，56 小时破解', crack: { label: '56 小时', seconds: 2.0e5 } },
  { year: '1999', text: '三重 DES 成为过渡方案' },
  { year: '2001', text: 'AES 发布（FIPS PUB 197），Rijndael 胜出' },
  { year: '2004', text: 'DES 标准 FIPS PUB 46-3 被正式撤销' },
  { year: '2006', text: 'COPACOBANA：$10,000 的 FPGA 集群，9 天破解', crack: { label: '9 天', seconds: 7.8e5 } },
  { year: '2008', text: 'RIVYERA：1 天内破解', crack: { label: '1 天', seconds: 8.6e4 } },
  { year: '2016', text: 'Hashcat + 8 块 GTX 1080Ti 显卡，2 天破解', crack: { label: '2 天', seconds: 1.7e5 } },
  { year: '2017', text: '针对特定明文的 CPA 攻击：25 秒拿到密钥', crack: { label: '25 秒', seconds: 25 } },
]

const MIN_LOG = Math.log10(25)
const MAX_LOG = Math.log10(8.3e6)

function barWidth(seconds: number): number {
  if (!isFinite(seconds)) return 100
  return 12 + ((Math.log10(seconds) - MIN_LOG) / (MAX_LOG - MIN_LOG)) * 88
}

export default function BcSummary() {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? timeline : timeline.filter((e) => e.crack || ['1977', '2001', '2004'].includes(e.year))

  return (
    <Section
      id="bc-summary"
      index="06 · 编年史与总结"
      title="DES 的一生，与块密码的遗产"
      subtitle="从国家标准到 25 秒可破，DES 用了 40 年。这不是某个算法的故事，而是所有启发式构造共同的命运曲线：安全性会随算力与密码分析的进步持续折旧。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <History className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              DES 编年史（1973–2017）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {visible.map((e) => (
              <div key={e.year} className="flex gap-3 border-l-2 border-border py-1.5 pl-4">
                <span className="w-12 shrink-0 font-mono text-sm font-semibold text-rose-600 dark:text-rose-400">
                  {e.year}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-muted-foreground">{e.text}</p>
                  {e.crack && isFinite(e.crack.seconds) && (
                    <div className="mt-1 flex items-center gap-2">
                      <div
                        className="h-2 rounded-full bg-rose-500/70"
                        style={{ width: `${barWidth(e.crack.seconds)}%` }}
                      />
                      <span className="shrink-0 font-mono text-xs text-rose-700 dark:text-rose-300">
                        {e.crack.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-2 text-xs text-rose-600 hover:underline dark:text-rose-400"
            >
              {showAll ? '收起完整时间线' : '展开完整时间线（含标准沿革）'}
            </button>
            <p className="pt-2 text-xs text-muted-foreground">
              红条长度按破解耗时对数缩放：从 96 天到 25 秒，五个数量级的坍塌。
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Crown className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                继任者 AES
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>
                1997 年 NIST 公开召集，2001 年 Daemen 与 Rijmen 的
                <span className="text-foreground"> Rijndael </span>胜出——
                第一个可用于绝密信息的公开密码。128 比特分组，128/192/256 比特密钥；
                <span className="text-foreground">不是 Feistel，而是 SPN</span>。
              </p>
              <p className="font-mono text-xs">
                缩减轮变体的最佳攻击：6/10 轮 2²⁷（128 位密钥）· 8/12 轮 2¹⁸⁸（192 位）·
                8/14 轮 2²⁰⁴（256 位）——全轮数至今安然无恙。
              </p>
              <p className="text-xs">
                设计目标不只是安全，还有效率与灵活性：软件、硬件、智能卡上都要跑得快。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Landmark className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                思考：国密 SM4 与"不公开"的争议
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>
                SM4 是我国商用分组密码标准（无线局域网、TLS），吕述望老师主持设计，2006
                年解密、2012 年发布。SM1、SM7 至今保密，仅以芯片形态使用。
              </p>
              <p className="text-xs">
                对照本讲第一原则：为什么"公开"反而更安全？不公开的算法能得到多少双眼睛的检验？
              </p>
            </CardContent>
          </Card>

          <Card className={cn('border-border bg-card/60')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <ListChecks className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                本讲要点
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                <li>
                  块密码是<span className="text-foreground">启发式 PRP</span>：信心来自"抗住了所有已知攻击"，
                  而非证明。
                </li>
                <li>
                  混淆（S 盒）+ 扩散（P 盒）是两条设计支柱；S 盒必须可逆（SPN），或者改用
                  Feistel 结构豁免这条约束。
                </li>
                <li>雪崩效应：1 比特输入变化 → 每个输出比特 50% 概率翻转。</li>
                <li>
                  密钥翻倍 ≠ 安全翻倍：MITM 用 O(2ⁿ) 时空破解双重加密；白化（DESX）与三重加密才是正解。
                </li>
                <li>
                  线性/差分分析只数频率：穿透 S 盒 → 链接近似 → 反推末轮少数密钥比特。
                </li>
                <li>
                  块密码只提供"随机排列"，不防篡改；块要够长；想要流密码就用块密码的 CTR 模式。
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}
