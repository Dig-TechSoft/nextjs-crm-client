"use client";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function VerificationPage() {
  const t = useTranslations("Verification");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [accountInfo, setAccountInfo] = useState<{
    demo_login?: string | null;
    real_login?: string | null;
    status?: string;
  }>({});
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/accounts/list");
        const data = await res.json();
        if (data.success) {
          setAccountInfo(data);
          setStatus("ready");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };
    load();
  }, []);

  const canCreateLive =
    accountInfo &&
    !accountInfo.real_login &&
    (accountInfo.status === "demo_created" || accountInfo.status === "" || accountInfo.status === null);

  const handleCreateLive = async () => {
    setError("");
    setSuccess("");
    if (!password) {
      setError(t("passwordRequired"));
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/accounts/create-real", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(t("liveCreated"));
        setAccountInfo((prev) => ({ ...prev, real_login: data.real_login, status: "accounts_created" }));
      } else {
        setError(data.message || t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-2 relative">
          <div className="absolute right-0 top-0">
            <LanguageSwitcher />
          </div>
          <div className="flex flex-col items-center gap-3">
            <Image
              src="/images/flamycom.png"
              alt="Flamycom logo"
              width={420}
              height={118}
              className="h-20 w-auto"
            />
            <CardTitle className="text-2xl font-bold text-center">
              {t("title")}
            </CardTitle>
          </div>
          <CardDescription className="text-center">{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div className="rounded-lg border p-4 bg-muted/50 space-y-2">
            <p className="text-sm text-muted-foreground">
              {status === "loading" ? t("loading") : t("placeholder")}
            </p>
            {accountInfo.demo_login && (
              <p className="text-sm font-semibold">
                {t("demoAccount")}: {accountInfo.demo_login}
              </p>
            )}
            {accountInfo.real_login && (
              <p className="text-sm font-semibold">
                {t("realAccount")}: {accountInfo.real_login}
              </p>
            )}
          </div>

          {canCreateLive && (
            <div className="space-y-3 rounded-lg border p-4">
              <p className="font-semibold">{t("createLiveTitle")}</p>
              <p className="text-sm text-muted-foreground">{t("createLiveDesc")}</p>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="password">
                  {t("passwordLabel")}
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                />
              </div>
              <Button className="w-full" onClick={handleCreateLive} disabled={creating}>
                {creating ? t("creating") : t("startKyc")}
              </Button>
            </div>
          )}

          {!canCreateLive && accountInfo.real_login && (
            <Button className="w-full" disabled>
              {t("liveReady")}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
