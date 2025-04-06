import { redirect } from 'next/navigation'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Home({ params }: any) {
  const locale = params.locale;
  redirect(`/${locale}/lists`)
}
