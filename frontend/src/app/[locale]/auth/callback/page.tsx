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
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          if (session?.user) {
            try {
              const { data: session } = await supabase.auth.getSession()

              if (!session || !session.session || !session.session.user) {
                throw new Error('Session or user not found.')
              }

              router.push('/')
            } catch (error) {
              console.error('Error during session handling:', error)
            }
          } else {
            console.error('No user session found after SIGNED_IN event.')
          }
        }
      }
    )

    return () => {
      authListener?.subscription?.unsubscribe()
    }
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
