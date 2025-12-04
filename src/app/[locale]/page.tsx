import { ActionButtons } from "@/components/dashboard/ActionButtons";
import { BalanceChart } from "@/components/dashboard/BalanceChart";
import { BalanceDisplay } from "@/components/dashboard/BalanceDisplay";
import { Header } from "@/components/layout/Header";
import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { query } from "@/lib/db";
import {getTranslations} from 'next-intl/server';

async function getUserData(login: string) {
  try {
    const res = await fetch(`http://127.0.0.1:3000/api/user/account/get?login=${login}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
        console.error("API returned error status:", res.status);
        return null;
    }
    const json = await res.json();
    if (json.retcode !== "0 Done") {
        console.error("API returned error code:", json.retcode);
        return null;
    }
    return json.answer;
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return null;
  }
}

export default async function Home({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const t = await getTranslations('Dashboard');

  if (!session) {
    redirect({href: '/login', locale});
  }

  const userData = await getUserData(session!.value);
  
  // Default data if fetch fails
  const defaultData = {
      Login: session!.value,
      Balance: "0.00",
      Credit: "0.00",
      Margin: "0.00",
      MarginFree: "0.00",
      MarginLevel: "0.00",
      Equity: "0.00",
      Profit: "0.00",
      Floating: "0.00"
  };

  const data = userData || defaultData;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('title')}</h2>
            <p className="text-muted-foreground">
              {t('welcome')}
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <ActionButtons />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-12 space-y-4">
            <BalanceDisplay data={data} />
          </div>
        </div>

        <div className="grid gap-4">
          <BalanceChart />
        </div>
      </main>
    </div>
  );
}
