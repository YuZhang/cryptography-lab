import { ScrollText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Section } from './shared'

interface Story {
  year: string
  title: string
  text: string
  tag?: { label: string; href: string }
}

const stories: Story[] = [
  {
    year: '约公元前 58 年',
    title: '凯撒的军用密码',
    text: '《罗马十二帝王传》记载：凯撒在军情密信中把字母表后移三位，"把 D 写成 A"。两千年前的军事密码，今天三分钟就能破——密钥空间的概念由此呼之欲出。',
    tag: { label: '凯撒密码', href: '#caesar' },
  },
  {
    year: '9 世纪',
    title: 'Al-Kindi 与频率分析的诞生',
    text: '巴格达学者肯迪写下《破译加密信息手稿》——人类最早的密码分析文献，比西方早了约七百年。他洞察到：替换可以改变字母的名字，却改变不了字母的频率。',
    tag: { label: '频率分析', href: '#substitution' },
  },
  {
    year: '1553',
    title: 'Bellaso 发明了"维吉尼亚密码"',
    text: '意大利密码学家 Giovan Battista Bellaso 出版《La cifra》，首次描述用双方约定的秘密关键词循环切换移位表的多表密码。只要换个关键词就换了整套替换模式——保密一个短短的关键短语即可，已有 Kerckhoffs 原则的雏形。',
    tag: { label: '维吉尼亚', href: '#vigenere' },
  },
  {
    year: '1586',
    title: '真正的维吉尼亚密码，是另一个',
    text: '法国外交官 Blaise de Vigenère 在法王亨利三世宫廷前发表的其实是一种更强的"自动密钥"（autokey）密码：用明文自身延续密钥流，密钥不重复。19 世纪史学家把两人混为一谈，循环关键词密码被错冠维吉尼亚之名，沿用至今。David Kahn 在《The Codebreakers》中感叹：历史"把一个倒退的、初级的密码冠以维吉尼亚之名——尽管他与它毫无关系"。',
  },
  {
    year: '1843',
    title: '爱伦·坡《金甲虫》',
    text: '侦探小说鼻祖爱伦·坡让主人公 Legrand 靠"密文里出现最多的符号应该是 e"一步步破解海盗基德的藏宝图。坡本人是密码迷，曾在报纸开专栏宣称能破解读者投稿的任何单表替换密码——而且真的全部破了出来。',
    tag: { label: '单表替换', href: '#substitution' },
  },
  {
    year: '1854 – 1863',
    title: '暗破与发表：Babbage 与 Kasiski',
    text: '计算机先驱巴贝奇在克里米亚战争期间已悄悄破解"不可破译的密码"，但从未发表（一说为保住英国的情报优势）。直到 1863 年，普鲁士军官 Kasiski 独立发表《秘密书写与破译艺术》，世人才知道怎么破——这一次，名字总算给对了人：Kasiski 检验法。',
    tag: { label: 'Kasiski 方法', href: '#vigenere' },
  },
  {
    year: '1861 – 1865',
    title: '南北战争中的"政府密码"',
    text: '南方邦联把维吉尼亚密码当作政府密码使用——显然不知道它已被公开破解，北方密码分析员全程阅读他们的电报。真实使用过的关键词：Manchester Bluff、Complete Victory、Come Retribution。',
  },
  {
    year: '1868',
    title: 'Lewis Carroll 的误判',
    text: '《爱丽丝梦游仙境》的作者撰文称维吉尼亚密码"不可破"——他不知道 Babbage 十几年前就已经破了它。权威背书不等于安全，这正是"任意敌手原则"的历史注脚。',
  },
  {
    year: '1883',
    title: 'Kerckhoffs 六原则',
    text: '荷兰语言学家 Auguste Kerckhoffs 在《军事密码学》中写下：加密方法一定不必是秘密，即便落入敌手也必无不妥。六十年后香农把它凝练为一句箴言：敌人了解系统。',
    tag: { label: '现代密码学原则', href: '#principles' },
  },
  {
    year: '1990 年代',
    title: '把军火印成书',
    text: '冷战时期美国把密码学列入军火管制清单。PGP 作者 Phil Zimmermann 因软件流出海外被刑事调查三年——他的应对是把 PGP 全部源代码印刷成书合法出口：书籍受言论自由保护，而同样的代码做成软件却是"军火"。',
  },
  {
    year: '2013',
    title: 'Dual EC 后门',
    text: '斯诺登披露：经 NIST、ANSI、ISO 标准化的随机数算法 Dual EC 被 NSA 系统性削弱，路透社报道 NSA 向 RSA 公司支付 1000 万美元将其设为默认。成为标准也不等于安全——开放设计与公开检验为什么必要，这是最鲜活的现代案例。',
    tag: { label: '开放设计', href: '#principles' },
  },
]

export default function StoriesSection() {
  return (
    <Section
      id="stories"
      index="05 · 历史趣闻"
      title="密码学史时间线"
      subtitle="两千年攻防史：每一个「不可破」的神话都倒下了，每一次倒下都换来一条原则。讲完原理，可以用这些故事收束课堂。"
    >
      <div className="relative ml-3 border-l-2 border-amber-500/30 pl-8">
        {stories.map((s, i) => (
          <div key={i} className="relative pb-10 last:pb-0">
            {/* 时间轴圆点 */}
            <span className="absolute -left-[41px] top-1 h-4 w-4 rounded-full border-2 border-amber-500 bg-background" />
            <div className="mb-1 flex flex-wrap items-center gap-3">
              <span className="font-mono text-sm font-semibold text-amber-600 dark:text-amber-400">
                {s.year}
              </span>
              {s.tag && (
                <a href={s.tag.href}>
                  <Badge
                    variant="outline"
                    className="border-border text-muted-foreground transition-colors hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-300"
                  >
                    相关：{s.tag.label}
                  </Badge>
                </a>
              )}
            </div>
            <h3 className="mb-1 flex items-center gap-2 text-base font-semibold text-foreground">
              <ScrollText className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              {s.title}
            </h3>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
