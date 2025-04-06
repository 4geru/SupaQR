'use client'

import { useTranslations } from 'next-intl'

export default function ListsPage() {
  const t = useTranslations('Lists')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <div className="text-center text-gray-500 mt-8">
        {t('empty')}
      </div>
      <div className="mt-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          {t('create')}
        </button>
      </div>
    </div>
  )
} 