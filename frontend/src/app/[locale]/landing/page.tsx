'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function LandingPage() {
  const t = useTranslations('LandingPage');

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen">
        <div className="p-8 bg-white rounded-lg shadow-xl min-w-2xl max-w-2xl text-center">
          <div className="flex justify-center mb-6">
             <Image
                src="/images/SupaQR-icon.png"
                alt="SupaQR Logo"
                width={200}
                height={200}
                priority
             />
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3">SupaQR</h1>
          <p className="text-xl text-gray-600 mb-8">{t('subtitle')}</p>

          <div className="space-y-6 text-left">
            <h2 className="text-3xl font-semibold text-gray-800 text-center">{t('usageTitle')}</h2>
            <ol className="list-decimal list-inside space-y-3 text-lg text-gray-700 mx-auto max-w-2xl">
              <li>{t('step1')}</li>
              <li>{t('step2')}</li>
              <li>{t('step3')}</li>
              <li>{t('step4')}</li>
            </ol>
          </div>
       </div>
    </div>
  );
} 