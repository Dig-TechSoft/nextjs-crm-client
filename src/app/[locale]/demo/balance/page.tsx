"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function DemoBalancePage() {
  const t = useTranslations("DemoBalance");
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [current, setCurrent] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const val = Number(amount);
    if (!Number.isFinite(val) || val <= 0) {
      setError(t("invalid"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/demo/set_balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: val }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(t("success"));
      } else {
        setError(data.message || t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/accounts/list");
        const acct = await res.json();
        if (!acct.success || acct.current_type !== "demo") {
          router.push("/");
          return;
        }
        const accountRes = await fetch(
          `/api/user/account/get?login=${acct.current_login}`,
          { cache: "no-store" }
        );
        const accountJson = await accountRes.json();
        if (accountJson.retcode === "0 Done") {
          setCurrent(Number(accountJson.answer?.Balance || 0));
        }
      } catch (err) {
        console.error("Failed to load demo balance", err);
      }
    };
    load();
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Card className="p-6 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-xs text-muted-foreground">{t("current")}</p>
                <p className="text-2xl font-bold">
                  {current !== null ? `$${current.toFixed(2)}` : t("loading")}
                </p>
              </div>
              <div className="sm:col-span-2 rounded-lg border p-4">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="amount">
                      {t("amount")}
                    </label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">{t("hint")}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={loading}>
                      {loading ? t("updating") : t("submit")}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => router.push("/")}>
                      {t("back")}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              {t("note")}
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
