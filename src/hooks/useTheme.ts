import { useEffect, useState } from 'react'

/** 深浅色主题：读取 localStorage 中的偏好，切换时写回 */
export function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return { dark, toggle: () => setDark((d) => !d) }
}
