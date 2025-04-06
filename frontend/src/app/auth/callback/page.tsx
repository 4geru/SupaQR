'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLocale, useTranslations } from 'next-intl'

export default function AuthCallback() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('Auth')

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push(`/${locale}/lists`)
      }
    })
  }, [router, locale])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('authenticating')}</h1>
        <p className="mt-2">{t('pleaseWait')}</p>
      </div>
    </div>
  )
}
