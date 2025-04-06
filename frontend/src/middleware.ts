import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // サポートする言語
  locales: ['en', 'ja'],

  // デフォルトの言語
  defaultLocale: 'en',

  // 言語の自動検出を無効にする（強制的にパスから判断）
  localeDetection: false,

  // すべてのパスにロケールプレフィックスを強制する
  localePrefix: 'always'
});

export const config = {
  // マッチさせるパス（_nextやapiを除く）
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
