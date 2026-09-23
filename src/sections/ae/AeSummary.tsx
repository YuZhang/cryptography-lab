import { BookMarked, ListChecks } from 'lucide-react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Section } from '../shared'

const glossary = [
  { term: 'IV', def: '密码学原语的输入，提供随机性', example: 'CBC 的初始向量' },
  { term: 'Nonce', def: '一次通信只用一次的数', example: 'GCM 的 96 位 nonce' },
  { term: 'Counter', def: '连续递增的数，可当 nonce/IV', example: 'CTR 模式的计数器' },
  { term: 'Tweak', def: '一个密码中对每块只用一次的输入', example: 'XTS 的 (扇区, 块号)' },
  { term: 'Salt', def: '随机比特，用来构造函数输入', example: '口令哈希、HKDF 提取' },
]

export default function AeSummary() {
  return (
    <Section
      id="ae-summary"
      index="06 · 总结"
      title="本讲要点"
      subtitle="认证加密不是可选项而是默认项：现代协议里裸加密几乎总是错的。记住一句话——先加密后认证，先验证后解密，错误信息无差别。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <ListChecks className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              五条主线
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="text-foreground">AE = CCA 安全 + 认证通信</span>；
                EtA（加密→对密文做 MAC，验证不过输出 ⊥）是唯一普遍安全的组合。
              </li>
              <li>
                <span className="text-foreground">证明思想：让解密预言机失业</span>——
                Pr[VQ] 归约到 MAC 伪造，无 VQ 时退化为 CPA。
              </li>
              <li>
                <span className="text-foreground">实现能摧毁理论</span>：错误分类（TLS 填充预言机）、
                非原子解密（SSH 数包攻击）、密钥复用（Mac_k = Dec_k 反例）。
              </li>
              <li>
                <span className="text-foreground">确定性加密</span>需新定义（⟨k,m⟩ 唯一）：
                SIV / 宽块 PRP / XTS 三条路线，分别服务数据库索引与磁盘。
              </li>
              <li>
                <span className="text-foreground">KDF</span>：均匀密钥计数器扩展；
                非均匀密钥 HKDF 提取-扩展；口令加盐 + 迭代延展（PBKDF）。
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              私钥部分至此收官：
              <Link to="/cpa-cca" className="text-orange-600 hover:underline dark:text-orange-400"> 第四讲 </Link>
              给了 CPA，<Link to="/mac-hash" className="text-orange-600 hover:underline dark:text-orange-400">第七讲 </Link>
              给了 MAC，本讲把它们砌成了 AE。下一站：公钥世界。
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BookMarked className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              五个容易混淆的「随机数」
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {glossary.map((g) => (
              <div key={g.term} className="flex items-baseline gap-3 rounded-lg border border-border bg-muted/40 p-3">
                <code className="w-16 shrink-0 font-mono text-sm font-semibold text-orange-700 dark:text-orange-300">
                  {g.term}
                </code>
                <div className="min-w-0">
                  <div className="text-xs text-foreground">{g.def}</div>
                  <div className="text-[11px] text-muted-foreground">例：{g.example}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
