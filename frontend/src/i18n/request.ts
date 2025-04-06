import {getRequestConfig} from 'next-intl/server'

export default getRequestConfig(async ({locale}) => {
  const defaultLocale = 'en'
  const currentLocale = locale || defaultLocale

  try {
    return {
      locale: currentLocale,
      messages: (await import(`./messages/${currentLocale}.json`)).default
    }
  } catch {
    return {
      locale: defaultLocale,
      messages: (await import(`./messages/${defaultLocale}.json`)).default
    }
  }
}) 
