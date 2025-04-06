'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const t = useTranslations('LandingPage');

  return (
    <div className={`${styles.container} flex justify-center items-center min-h-screen`}>
        <div className={`${styles.card} bg-white rounded-lg shadow-xl text-center`}>
          <div className={`${styles.logoContainer} flex justify-center`}>
             <Image
                src="/images/SupaQR-icon.png"
                alt="SupaQR Logo"
                width={200}
                height={200}
                priority
             />
          </div>
          <h1 className={`${styles.title} font-extrabold text-gray-900`}>SupaQR</h1>
          <p className={`${styles.subtitle} text-gray-600`}>{t('subtitle')}</p>

          <div className="space-y-6 text-left">
            <h2 className={`${styles.usageTitle} font-semibold text-gray-800 text-center`}>{t('usageTitle')}</h2>
            <ol className={`${styles.stepList} list-decimal list-inside space-y-3 text-gray-700`}>
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