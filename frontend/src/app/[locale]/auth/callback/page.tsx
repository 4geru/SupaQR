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
              const { data: user, error: selectError } = await supabase
                .from('users')
                .select('id')
                .eq('id', session.user.id)
                .single()

              if (selectError && selectError.code !== 'PGRST116') {
                console.error('Error checking user:', selectError)
                throw selectError
              }

              if (!user) {
                console.log(`User data not found for id ${session.user.id}. Creating new user entry.`)
                const { error: insertError } = await supabase
                  .from('users')
                  .insert({
                    id: session.user.id,
                    email: session.user.email,
                  })

                if (insertError) {
                  console.error('Error creating user entry:', insertError)
                  throw insertError
                }
                console.log(`User entry created for id ${session.user.id}.`)
              } else {
                console.log(`User entry found for id ${session.user.id}.`)
              }

              router.push(`/${locale}/lists`)
            } catch (error) {
              console.error('Error ensuring user profile:', error)
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
