// app/funds/withdrawal/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/layout/Header";
import {
  ArrowUpCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface AccountData {
  Balance: string;
  Credit: string;
  Equity: string;
  Margin: string;
  MarginFree: string;
  MarginLevel: string;
}

export default function WithdrawalPage() {
  const t = useTranslations('Funds');
  const tCommon = useTranslations('Common');
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);

  const formatAmount = (value: string) => {
    const num = parseFloat(value);
    return Number.isFinite(num) ? num.toFixed(2) : "0.00";
  };

  useEffect(() => {
    const loadAccount = async () => {
      try {
        setAccountLoading(true);
        setError("");

        const parseAccount = (payload: any): AccountData | null =>
          payload?.retcode === "0 Done" && payload.answer
            ? (payload.answer as AccountData)
            : null;

        const fetchAccount = async (url: string) => {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) throw new Error(`Account fetch failed: ${res.status}`);
          return res.json();
        };

        // 1) Try session-based call (API infers login from cookie) — same path the dashboard can use.
        let account: AccountData | null = null;
        try {
          account = parseAccount(await fetchAccount("/api/user/account/get"));
        } catch (err) {
          console.warn("Session-based account fetch failed", err);
        }

        // 2) If still missing, resolve login then try relative and direct host as fallback.
        if (!account) {
          const profileRes = await fetch("/api/profile");
          if (!profileRes.ok) {
            if (profileRes.status === 401) {
              setError("Login session not found. Please log in again.");
              return;
            }
            throw new Error(`Profile fetch failed: ${profileRes.status}`);
          }
          const profileData = await profileRes.json();
          const login = profileData?.user?.Login;
          if (!login) {
            throw new Error("Missing login in profile response");
          }

          try {
            account = parseAccount(
              await fetchAccount(`/api/user/account/get?login=${login}`)
            );
          } catch (err) {
            console.warn(
              "Relative account fetch failed, trying direct host",
              err
            );
            account = parseAccount(
              await fetchAccount(
                `http://127.0.0.1:3000/api/user/account/get?login=${login}`
              )
            );
          }
        }

        if (account) {
          setAccountData(account);
        } else {
          setError("Invalid account data received");
        }
      } catch (err: any) {
        console.error("Failed to load account:", err);
        setError(tCommon('error'));
      } finally {
        setAccountLoading(false);
      }
    };

    loadAccount();
  }, []);

  const canSubmit =
    !!amount &&
    !!bankName &&
    !!accountNumber &&
    !!accountName &&
    !!accountData &&
    !loading &&
    !accountLoading;

  const handleSubmit = async () => {
    const available = parseFloat(accountData?.Balance || "0");
    if (parseFloat(amount) > available) {
      setError(
        `Insufficient available funds (margin free: $${available.toFixed(2)})`
      );
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("bankName", bankName);
    formData.append("accountNumber", accountNumber);
    formData.append("accountName", accountName);

    try {
      const res = await fetch("/api/funds/withdrawal", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        setSuccess(true);
      } else {
        setError(json.error || tCommon('error'));
      }
    } catch (err) {
      setError(tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-2xl mx-auto">
          {success ? (
            <div className="text-center">
              <Card className="border-green-600">
                <CardContent className="pt-12 pb-10">
                  <CheckCircle2 className="h-16 w-16 sm:h-20 sm:w-20 text-green-600 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold mb-3">
                    {t('withdrawSuccess')}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Amount: <strong>${amount}</strong> to{" "}
                    <strong>{bankName}</strong>
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {t('pendingReview')}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <ArrowUpCircle className="h-14 w-14 sm:h-16 sm:w-16 text-red-600 mx-auto mb-4" />
                <h1 className="text-3xl sm:text-4xl font-bold">
                  {t('withdrawalRequest')}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {t('secureWithdrawal')}
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('withdrawToBank')}</CardTitle>
                  <CardDescription>
                    {t('onlineBank')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {accountLoading && (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('loadingAccount')}
                      </p>
                    </div>
                  )}

                  {accountData && !accountLoading && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>{t('balanceAvailable')}</span>
                        <strong>${formatAmount(accountData.Balance)}</strong>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>{t('amountWithdraw')}</Label>
                    <Input
                      type="number"
                      placeholder="500.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="50"
                      step="0.01"
                      disabled={loading || accountLoading}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('bankName')}</Label>
                      <Input
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        disabled={loading || accountLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('accountNumber')}</Label>
                      <Input
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        disabled={loading || accountLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('accountHolder')}</Label>
                    <Input
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      disabled={loading || accountLoading}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t('minWithdraw')}
                    </AlertDescription>
                  </Alert>

                  <Button
                    className="w-full"
                    size="lg"
                    variant="destructive"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                  >
                    {loading ? t('submitting') : t('submitWithdraw')}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
