'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface List {
  id: number
  title: string
  description: string | null
  created_at: string
}

export default function ListsPage() {
  const t = useTranslations('Lists')
  const [lists, setLists] = useState<List[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{message: string, success: boolean} | null>(null)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) {
      setListLoading(true)
      return
    }

    if (!user) {
      console.log('User not authenticated, redirecting to login.')
      router.push('/login')
      setListLoading(false)
      return
    }

    console.log('User authenticated, fetching lists for user:', user.id)
    const fetchLists = async () => {
      setListLoading(true)
      setError(null)
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase connection information is not configured. Please check your environment variables.')
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        const { data, error: fetchError } = await supabase
          .from('lists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (fetchError) {
          console.error('List fetch error:', fetchError)
          throw new Error(`Failed to fetch lists: ${fetchError.message}`)
        }

        console.log('Lists fetched successfully:', data?.length ?? 0, 'items')
        setLists(data || [])
      } catch (err) {
        console.error('Error fetching lists:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        setLists([])
      } finally {
        setListLoading(false)
      }
    }
    
    fetchLists()
  }, [user, authLoading, router])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    const fileInput = event.target;
    if (!file) return

    console.log('ファイルアップロード開始:', file.name, file.size, file.type);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadResult({
        message: 'CSVファイルのみアップロード可能です',
        success: false,
      })
      fileInput.value = ''
      return
    }

    setUploading(true)
    setUploadResult(null)
    
    try {
      if (!user) {
        throw new Error('User not authenticated. Please login again.')
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase connection information is not configured.')
      }

      const supabase = createClient(supabaseUrl, supabaseKey)
      
      const fileContent = await file.text()
      
      if (!fileContent || fileContent.trim() === '') {
        throw new Error('ファイルが空です')
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session?.access_token) {
         throw new Error('Could not retrieve session information or access token.')
      }
      
      console.log('認証情報取得完了:', { 
        accessTokenExists: !!session.access_token,
        tokenLength: session.access_token?.length || 0,
        tokenFirstChars: session.access_token ? session.access_token.substring(0, 5) + '...' : 'なし'
      });
      
      console.log('ユーザー情報:', {
        userId: user.id,
        email: user.email
      });

      // ユーザーIDが有効か確認
      if (!user.id) {
        throw new Error('有効なユーザーIDがありません');
      }

      // 環境変数の確認
      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase接続情報がありません', {
          supabaseUrl: !!supabaseUrl,
          supabaseKey: !!supabaseKey
        });
        throw new Error('Supabase接続情報が設定されていません');
      }
      
      // すべてのパラメータが明示的に設定されていることを確認
      const requestBody = {
        csvData: fileContent,
        fileName: file.name,
        session: session
      };
      
      // JSON文字列に変換して確認
      const requestBodyString = JSON.stringify(requestBody);
      console.log('JSON文字列化したrequestBody:', requestBodyString.substring(0, 100) + '...');
      console.log('sessionのユーザーID:', session?.user?.id);
      
      console.log('API呼び出し前のrequestBody:', {
        fileName: requestBody.fileName,
        csvDataLength: requestBody.csvData.length,
        sessionExists: !!requestBody.session,
        sessionUserIdExists: !!requestBody.session?.user?.id
      });
      
      const response = await fetch('/api/upload-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
      })
      
      // レスポンスステータスを確認
      console.log('APIレスポンスステータス:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
       
      const result = await response.json()
      console.log('APIレスポンス:', result);
        
      if (!response.ok) {
        throw new Error(result.error || 'An error occurred during upload')
      }
        
      setUploadResult({
        message: result.message || `List "${result.title || 'New List'}" created successfully`,
        success: true,
      })
        
      const { data, error: fetchError } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        
      if (fetchError) {
        console.error(`Failed to re-fetch lists after upload: ${fetchError.message}`)
      } else {
         setLists(data || [])
      }
        
    } catch (err) {
      console.error('CSV upload error:', err)
      console.log('エラー詳細情報:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : null,
      });
      setUploadResult({
        message: `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 
        success: false,
      })
    } finally {
      setUploading(false)
      fileInput.value = ''
    }
  }

  const pageLoading = authLoading

  return (
    <div className="flex flex-col min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Lists fetched from Supabase lists table
        </p>
      </header>

      <main className="flex-grow">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {/* CSV Upload Form */}
          <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">CSV Upload</h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  key={uploadResult ? Date.now() : 'initial'}
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
            
            {uploading && (
              <div className="mt-3 flex items-center text-sm text-blue-600">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                Uploading...
              </div>
            )}
            
            {uploadResult && (
              <div className={`mt-3 p-3 rounded-md text-sm ${uploadResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {uploadResult.message}
              </div>
            )}
          </div>

          {error && !pageLoading && !listLoading && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <h3 className="font-bold mb-2">Error</h3>
              <p className="whitespace-pre-line">{error}</p>
            </div>
          )}
          
          {pageLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : listLoading ? (
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
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {lists.map((list) => (
                        <tr key={list.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <Link href={`/lists/${list.id}`} className="text-blue-600 hover:underline">
                              {list.id}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            <Link href={`/lists/${list.id}`} className="text-blue-600 hover:underline">
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
        <p>© 2024 Supabase Connector</p>
      </footer>
    </div>
  )
} 