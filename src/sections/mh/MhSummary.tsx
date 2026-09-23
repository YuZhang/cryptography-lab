import { Fingerprint, ListChecks } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Section } from '../shared'

const apps = [
  { name: '文件指纹与去重', desc: '病毒指纹库、网盘秒传、P2P 分块校验' },
  { name: '默克尔树', desc: '树状指纹定位坏块——区块链与证书透明日志的骨架' },
  { name: '口令哈希', desc: '(salt, H(salt‖pw))，加盐拖慢字典攻击' },
  { name: '密钥派生', desc: '从高熵但非均匀的共享秘密中提取均匀密钥' },
  { name: '承诺方案', desc: '先封存后揭晓——网上掷硬币不靠信任' },
]

export default function MhSummary() {
  return (
    <Section
      id="mh-summary"
      index="06 · 总结"
      title="本讲要点"
      subtitle="机密性保护内容不被看见，认证保护内容不被伪造——两者缺一不可，合在一起才构成第四讲所说的 CCA 级别安全。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <ListChecks className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              六条主线
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="text-foreground">认证 = 存在性不可伪造</span>：
                CMA 下连一条新消息的标签都造不出来，重放攻击交给序列号/时间戳。
              </li>
              <li>
                <span className="text-foreground">PRF ⟹ 安全 MAC</span>：t = F_k(m)；
                截断输出仍是 PRF（引理），安全证明是标准的区分器规约。
              </li>
              <li>
                <span className="text-foreground">变长是重灾区</span>：异或、逐块、带序号全灭；
                CBC-MAC 要 IV=0 + 只输出末块 + 长度绑定/ECBC/密钥分离三选一。
              </li>
              <li>
                <span className="text-foreground">CRHF 与生日悖论</span>：ℓ 位输出的碰撞只需
                2^(ℓ/2)；MD 变换把定长抗碰撞升级为变长抗碰撞（长度块不可省）。
              </li>
              <li>
                <span className="text-foreground">HMAC = H(k₂‖H(k₁‖m))</span>：
                双重包裹封死长度扩展；验证比较必须常数时间，否则计时旁路逐字节偷走标签。
              </li>
              <li>
                <span className="text-foreground">信息论 MAC</span>：SUF h=a·m+b mod p
                无需任何困难假设，但 ℓ 次安全要 (ℓ+1)·n 比特密钥——实践绕回计算安全。
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Fingerprint className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              哈希函数的应用版图
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {apps.map((a) => (
              <div key={a.name} className="rounded-lg border border-border bg-muted/40 p-3">
                <div className="text-sm font-medium text-foreground">{a.name}</div>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.desc}</p>
              </div>
            ))}
            <p className="text-xs leading-relaxed text-muted-foreground">
              机密性（第三、四讲）+ 完整性（本讲）= 安全的私钥通信。剩下的问题是：
              密钥 k 本身怎么交到对方手里？——下一讲，公钥密码学登场。
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
