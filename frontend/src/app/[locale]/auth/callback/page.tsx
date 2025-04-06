'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js';
import { useLocale, useTranslations } from 'next-intl'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const t = useTranslations('Auth')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(t('errors.configMissing'));
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code')

      if (code) {
        try {
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.exchangeCodeForSession(code)

          if (sessionError) {
            console.error('Error exchanging code for session:', sessionError)
            router.push('/?error=session_exchange_failed')
            return
          }

          if (session) {
            const { data: userData, error: userError } = await supabase.auth.getUser()

            if (userError) {
              console.error('Error fetching user:', userError)
              router.push('/?error=user_fetch_failed')
              return
            }

            if (userData?.user) {
              const { id, email } = userData.user

              if (!email) {
                console.error('User email is missing.')
                router.push('/?error=missing_email')
                return
              }

              const response = await fetch('/api/upload-list', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: id, email: email }),
              })

              if (!response.ok) {
                const errorData = await response.json()
                console.error('Error calling user upsert API:', errorData.error)
                router.push(`/?error=user_upsert_failed&message=${encodeURIComponent(errorData.error)}`)
                return
              }
              const result = await response.json()

              if (result.success) {
                localStorage.setItem(
                  'user',
                  JSON.stringify({ id: id, email: email }),
                )
                console.log('User info saved to local storage')
                router.push('/')
              } else {
                console.error('User upsert failed via API:', result.error)
                router.push(`/?error=user_upsert_api_failed&message=${encodeURIComponent(result.error)}`)
              }
            } else {
              console.log('No user data found after successful session exchange.')
              router.push('/?error=no_user_data')
            }
          } else {
            console.log('No session found after exchanging code.')
            router.push('/?error=no_session')
          }
        } catch (error) {
          console.error('Unexpected error during auth callback:', error)
          router.push('/?error=unexpected_callback_error')
        }
      } else {
        console.log('No authorization code found in URL.')
        router.push('/?error=no_auth_code')
      }
    }

    handleAuthCallback()
  }, [searchParams, router, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('authenticating')}</h1>
        <p className="mt-2">{t('pleaseWait')}</p>
      </div>
    </div>
  )
}
