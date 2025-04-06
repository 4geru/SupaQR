import { redirect } from 'next/navigation'

type Props = {
  params: {
    locale: string;
  };
};

export default async function Home(props: Props) {
  const params = await props.params;
  const locale = params.locale;
  redirect(`/${locale}/lists`)
}
