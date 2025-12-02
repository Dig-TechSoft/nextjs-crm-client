import { ActionButtons } from "@/components/dashboard/ActionButtons";
import { BalanceChart } from "@/components/dashboard/BalanceChart";
import { BalanceDisplay } from "@/components/dashboard/BalanceDisplay";
import { Header } from "@/components/layout/Header";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";

async function getUserData(login: string) {
  try {
    const users = await query('SELECT balance FROM mt5_users WHERE login = ?', [login]) as any[];
    if (users.length > 0) {
      return users[0];
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return null;
  }
}

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    redirect("/login");
  }

  const userData = await getUserData(session.value);
  const balance = userData ? userData.balance : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-6 space-y-8">
        <div className="flex flex-col space-y-2">
           <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
           <p className="text-muted-foreground">
             Welcome back to your trading overview.
           </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="col-span-2 space-y-4">
                <BalanceDisplay balance={balance} accountNumber={session.value} />
            </div>
            {/* You could add more widgets here, like Open Positions summary */}
        </div>

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <BalanceChart />
        </div>
      </main>
    </div>
  );
}
