'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('Header')
  const router = useRouter()
  const currentLocale = locale

  useEffect(() => {
    // 言語情報がパスに含まれているかチェック
    if (pathname && locale && !pathname.startsWith(`/${locale}`)) {
      // 現在のパスから言語セグメントを除外し、新しいロケールを追加してリダイレクト
      const newPath = `/${currentLocale}${pathname}`
      router.push(newPath)
    }
  }, [pathname, locale, router, currentLocale])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  const changeLanguage = (newLocale: string) => {
    // 言語を切り替える最もシンプルな方法
    if (newLocale !== locale) {
      // 現在のURLから言語部分を取得
      const currentUrl = window.location.href
      // 新しい言語に置き換える
      const newUrl = currentUrl.replace(/\/(en|ja)(\/|$)/, `/${newLocale}$2`)
      // 新しいURLに遷移する
      window.location.href = newUrl
    }
  }

  const handleLogoClick = () => {
    if (!user) {
      router.push(`/${locale}/landing`)
    } else {
      router.push(`/${locale}`)
    }
  }

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <button
                  type="button"
                  onClick={handleLogoClick}
                  className="text-xl font-bold text-gray-900 flex items-center gap-2 focus:outline-none"
                  aria-label={user ? "SupaQR Home" : "SupaQR Landing"}
                >
                  <Image
                    src="/images/SupaQR-icon.png"
                    alt="SupaQR Icon"
                    width={32}
                    height={32}
                  />
                  <span>SupaQR</span>
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    locale === 'en' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage('ja')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    locale === 'ja' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  日本語
                </button>
              </div>
              {user ? (
                <div className="hidden sm:flex flex items-center space-x-4">
                  <span className="text-gray-700">
                    {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex flex items-center space-x-4">
                  <Link
                    href={`/${locale}/login`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href={`/${locale}/signup`}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {t('signup')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
} 