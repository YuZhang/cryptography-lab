import { useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ALPHABET, sanitize, shiftEncrypt } from '@/lib/ciphers'
import { AlphabetMap, CipherText, Formula, Section } from './shared'

export default function CaesarSection() {
  const [plain, setPlain] = useState('begintheattacknow')
  const clean = useMemo(() => sanitize(plain), [plain])
  const cipher = useMemo(() => shiftEncrypt(clean, 3), [clean])

  return (
    <Section
      id="caesar"
      index="01 · 加密方案"
      title="凯撒密码 Caesar's Cipher"
      subtitle="凯撒将机密消息加密书写：将字母表中每个字母向后移动 3 位。若有人要解密，把第四个字母 D 替换成 A，其它字母也这么做。"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="text-foreground">动手加密</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Formula>Enc(m) = m + 3 (mod 26)</Formula>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">明文 m（只保留 a–z）</label>
              <Input
                value={plain}
                onChange={(e) => setPlain(e.target.value)}
                className="border-input bg-background font-mono text-foreground"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">密文 c</label>
              <CipherText
                text={cipher || '…'}
                className="text-amber-700 dark:text-amber-300"
              />
            </div>
            <AlphabetMap top={ALPHABET} bottom={shiftEncrypt(ALPHABET, 3)} />
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-red-500/5 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" /> 弱点分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-foreground">
            <p>
              凯撒密码
              <span className="font-semibold text-red-600 dark:text-red-400">根本没有密钥</span>
              ——加密方法是固定公开的。任何人只要知道「移 3 位」这个算法，就能解密一切。
            </p>
            <p>
              这直接违背了
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {' '}
                Kerckhoffs 原则
              </span>
              ：算法的保密不能作为安全的基础。秘密应该集中在一个短小的密钥上——密钥暴露时更换密钥即可，而算法可以公开接受检验。
            </p>
            <p className="text-muted-foreground">
              改进方向：把固定的「3」变成一个可选择的密钥 k，于是得到下面的移位密码。
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
