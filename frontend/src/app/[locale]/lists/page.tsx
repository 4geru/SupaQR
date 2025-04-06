'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { redirect } from 'next/navigation'

interface List {
  id: number
  title: string
  description: string | null
  created_at: string
}

export default function ListsPage() {
  const t = useTranslations('Lists')
  const [lists, setLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{message: string, success: boolean} | null>(null)
  const router = useRouter()
  const locale = useLocale()

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error(t('errors.configMissing'))
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          throw new Error(`${t('errors.auth')}: ${sessionError.message}`)
        }

        if (!session) {
          return redirect('/${params.locale}/login')
        }

        const userId = session.user.id
        
        // Get lists if authenticated
        const { data, error: fetchError } = await supabase
          .from('lists')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        if (fetchError) {
          console.error('List fetch error:', fetchError)
          throw new Error(`${t('errors.fetchFailed')}: ${fetchError.message}`)
        }

        if (!data || data.length === 0) {
          setLists([])
          return
        }

        setLists(data)
      } catch (e) {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        let errorMessage = t('errors.unknown');
        if (e instanceof Error) {
          errorMessage = e.message;
        } else if (typeof e === 'string') {
          errorMessage = e;
        }
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [locale, t, router])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadResult(null)
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error(t('errors.configMissing'))
      }

      const supabase = createClient(supabaseUrl, supabaseKey)
      
      // Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error(t('errors.loginRequired'))
      }

      // Read CSV file
      const fileContent = await file.text()
      
      // Get Access Token
      const accessToken = session.access_token
      if (!accessToken) {
        throw new Error(t('errors.tokenMissing'))
      }

      // Send data to API endpoint
      const requestBody = {
        listData: fileContent,
        listName: file.name,
        listDescription: '', // Add empty description for now
        user: session?.user, // Pass the user object for user creation check
      }
      
      const response = await fetch('/api/upload-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Add Authorization header
        },
        body: JSON.stringify(requestBody),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || t('errors.uploadFailed'))
      }
      
      setUploadResult({
        message: t('upload.success', { title: result.title }),
        success: true,
      })
      
      // Reload lists
      const { data, error: fetchError } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      
      if (fetchError) {
        throw new Error(`${t('errors.fetchFailed')}: ${fetchError.message}`)
      }
      
      setLists(data || [])
    } catch (err) {
      console.error('CSV upload error:', err)
      setUploadResult({
        message: `${t('upload.failed')}: ${err instanceof Error ? err.message : t('errors.unknown')}`,
        success: false,
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </header>

      <main className="flex-grow">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {/* CSV Upload Form */}
          <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">{t('upload.title')}</h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('upload.csvFile')}
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
            
            {uploading && (
              <div className="mt-3 flex items-center text-sm text-blue-600">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                {t('upload.uploading')}
              </div>
            )}
            
            {uploadResult && (
              <div className={`mt-3 p-3 rounded-md text-sm ${uploadResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {uploadResult.message}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <h3 className="font-bold mb-2">{t('errors.title')}</h3>
              <p className="whitespace-pre-line">{error}</p>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {lists.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('table.title')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('table.description')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('table.createdAt')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {lists.map((list) => (
                        <tr key={list.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            <Link href={`/${locale}/lists/${list.id}`} className="text-blue-600 hover:underline">
                              {list.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {list.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(list.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  {t('empty')}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>{t('footer.copyright')}</p>
      </footer>
    </div>
  )
}
