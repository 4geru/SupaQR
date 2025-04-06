'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const t = useTranslations('LandingPage');

  return (
    <div className={styles.pageContainer}>
        <div className={styles.contentBox}>
          <div className={styles.logoContainer}>
             <Image
                src="/images/SupaQR-icon.png"
                alt="SupaQR Logo"
                width={200}
                height={200}
                priority
             />
          </div>
          <h1 className={styles.title}>SupaQR</h1>
          <p className={styles.subtitle}>{t('subtitle')}</p>

          <div className={styles.usageSection}>
            <h2 className={styles.usageTitle}>{t('usageTitle')}</h2>
            <ol className={styles.usageList}>
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