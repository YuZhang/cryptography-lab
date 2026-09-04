import { useState } from 'react'
import { ArrowRight, Link2, RotateCw } from 'lucide-react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Formula, NavAnchor, Section } from '../shared'
import { cn } from '@/lib/utils'

interface Node {
  id: string
  label: string
  edge?: string // 指向下一个节点的边上标注的定理
  title: string
  body: string
  anchor?: string // 页内锚点
  ext?: { to: string; label: string } // 跨讲链接
}

const chain: Node[] = [
  {
    id: 'owf',
    label: 'OWF 单向函数',
    edge: 'Goldreich–Levin',
    title: '一切的起点',
    body: '正向多项式时间、逆向成功概率可忽略。乘法/模平方/离散指数/子集和都是候选。它是假设，不是构造——整条链的安全强度都押在它真的存在上。',
    anchor: 'tc-owf',
  },
  {
    id: 'hcp',
    label: 'HCP 核心断言',
    edge: 'Blum–Micali',
    title: 'g(x,r) = (f(x), r)，gl(x,r) = ⊕ xᵢ·rᵢ',
    body: '任意 OWF 都能改造成带核心断言的 OWF。随机串 r 临场挑选 x 的子集异或，敌手猜中率 ≤ 1/2 + 可忽略。',
    anchor: 'tc-hcp',
  },
  {
    id: 'prg',
    label: 'PRG',
    edge: 'GGM 二叉树',
    title: 'G(s) = (f(s), hc(s))，迭代扩展',
    body: 'f 是排列保证均匀游走，hc 不可预测保证下一比特测试通过。扩展因子从 n+1 迭代到任意多项式 p(n)。',
    anchor: 'tc-bm',
  },
  {
    id: 'prf',
    label: 'PRF',
    edge: 'Luby–Rackoff 3 轮',
    title: 'F_k(x) = 沿二叉树寻路',
    body: '2n 扩展的 PRG 逐层二分，n 层树长出 2ⁿ 片叶子。多项式时间访问指数大小的随机函数表。',
    anchor: 'tc-ggm',
  },
  {
    id: 'prp',
    label: 'PRP / 强 PRP',
    edge: '第四讲构造',
    title: '3 轮 Feistel：PRF ⇒ PRP；4 轮 ⇒ 强 PRP',
    body: 'Feistel 结构天然是排列，PRF 轮函数提供伪随机性。少一轮都会漏馅——区分器游戏里你已亲手验证。',
    anchor: 'tc-lr',
  },
  {
    id: 'enc',
    label: '安全私钥加密',
    edge: '必要性命题',
    title: 'Enc_k(m) = ⟨r, F_k(r) ⊕ m⟩（第四讲）',
    body: 'PRF + 随机 r 直接给出 CPA 安全加密；配合消息认证可升到 CCA 安全。私钥密码学的目标达成。',
    ext: { to: '/cpa-cca', label: '回看第四讲' },
  },
  {
    id: 'back',
    label: '回到 OWF',
    title: '闭环：安全加密 ⇒ OWF',
    body: 'f(k,m,r) = (Enc_k(m,r), m)。能破解加密方案的敌手可以被规约成求逆 f 的敌手——所以 OWF 不仅是充分条件，也是必要条件。',
  },
]

export default function TcSummary() {
  const [sel, setSel] = useState<Node>(chain[0])

  return (
    <Section
      id="tc-summary"
      index="06 · 总结"
      title="构造闭环：OWF ⇔ 整个私钥密码学"
      subtitle="把本讲的定理串起来，得到现代密码学最壮丽的全景之一：单向函数存在当且仅当（有意义的）私钥密码学存在。点击链上的每一环回看它的构造。"
    >
      <Card className="border-border bg-card/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Link2 className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
            构造链全景（可点击）
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-x-1 gap-y-3">
            {chain.map((n, i) => (
              <span key={n.id} className="flex items-center gap-1">
                <button
                  onClick={() => setSel(n)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold transition-all',
                    sel.id === n.id
                      ? 'border-fuchsia-500 bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300'
                      : 'border-border bg-muted/40 text-muted-foreground hover:border-fuchsia-400'
                  )}
                >
                  {n.label}
                </button>
                {n.edge && (
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <ArrowRight className="h-3 w-3 shrink-0 text-fuchsia-500" />
                    <span className="max-w-20 leading-tight">{n.edge}</span>
                  </span>
                )}
                {i === chain.length - 1 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <ArrowRight className="h-3 w-3 shrink-0 text-fuchsia-500" />
                    <RotateCw className="h-3 w-3 text-fuchsia-500" />
                  </span>
                )}
              </span>
            ))}
          </div>

          <div className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/5 p-4">
            <div className="mb-1 font-mono text-sm font-semibold text-fuchsia-700 dark:text-fuchsia-300">
              {sel.title}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{sel.body}</p>
            {sel.anchor && (
              <NavAnchor
                id={sel.anchor}
                className="mt-2 inline-block text-xs text-fuchsia-600 hover:underline dark:text-fuchsia-400"
                label="跳到本讲对应实验 ↓"
              />
            )}
            {sel.ext && (
              <Link
                to={sel.ext.to}
                className="mt-2 inline-block text-xs text-fuchsia-600 hover:underline dark:text-fuchsia-400"
              >
                {sel.ext.label} →
              </Link>
            )}
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <div className="mb-2 text-sm font-medium text-foreground">必要性命题的规约要点</div>
            <Formula>f(k, m, r) = ( Enc_k(m, r), m )</Formula>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-muted-foreground">
              <li>把挑战密文拼上明文 c‖m₀ 作为求逆算法 A 的输入；</li>
              <li>若加密的是 m₀：破解加密 ⟺ 成功求逆，概率继承敌手优势；</li>
              <li>若加密的是 m₁：A 看到的明文与密文无关，求逆成功的概率仅 1/2ⁿ；</li>
              <li>两种情形的输出差即为不可区分优势——加密不安全 ⇒ f 不单向，逆否得证。</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        至此，私钥密码学的理论地基闭合了。接下来课程将走向公开问题：密钥本身怎么安全地交换？——公钥密码学在等着。
      </p>
    </Section>
  )
}
