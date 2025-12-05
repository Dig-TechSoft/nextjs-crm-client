"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Save, AlertCircle, CheckCircle2, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [accounts, setAccounts] = useState<{
    demo_login: string | null;
    real_login: string | null;
  } | null>(null);
  const [target, setTarget] = useState<string>("email");
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/accounts/list");
      const data = await res.json();
      if (data.success) {
        setAccounts({ demo_login: data.demo_login, real_login: data.real_login });
        setTarget(data.real_login || data.demo_login ? "email" : "email");
      }
    } catch (err) {
      console.error("Failed to load accounts", err);
    } finally {
      setRefreshing(false);
    }
  };

  const isValidPassword = (value: string) => {
    const pattern =
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*._-])[A-Za-z0-9!@#$%^&*._-]{8,12}$/;
    return pattern.test(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      setLoading(false);
      return;
    }

    if (!isValidPassword(formData.newPassword)) {
      setError(t("passwordPolicy"));
      setLoading(false);
      return;
    }

    try {
      if (target === "email") {
        const res = await fetch("/api/auth/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setSuccess(t("success"));
          setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } else {
          setError(data.message || t("errorMessage"));
        }
      } else {
        const login = target;
        // Verify current password
        const checkRes = await fetch(
          `/api/user/check_password?login=${login}&password=${encodeURIComponent(formData.currentPassword)}&type=main`
        );
        const checkData = await checkRes.json();

        if (!checkData.success || !checkData.valid) {
          setError(t("currentIncorrect"));
          setLoading(false);
          return;
        }

        const res = await fetch(
          `/api/user/change_password?login=${login}&type=main&password=${encodeURIComponent(formData.newPassword)}`
        );
        const data = await res.json();

        if (data.success) {
          setSuccess(t("success"));
          setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } else {
          const errorMessage = data.retcode ? data.retcode.replace(/^\d+\s*/, "") : t("errorMessage");
          setError(errorMessage);
        }
      }
    } catch (err) {
      setError(t("errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {t("security")}
              </CardTitle>
              <CardDescription>
                {t("updatePassword")}
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="mb-4">
                <Label className="mb-2 block text-sm font-medium">{t("targetLabel")}</Label>
                <RadioGroup
                  value={target}
                  onValueChange={(val) => setTarget(val)}
                  className="space-y-3"
                >
                  <Label className="flex items-center justify-between space-x-3 rounded-lg border p-3 hover:bg-accent/40">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="email" id="email-target" />
                      <div>
                        <p className="font-semibold">{t("targetEmail")}</p>
                        <p className="text-xs text-muted-foreground">{t("targetEmailDesc")}</p>
                      </div>
                    </div>
                  </Label>
                  {accounts?.demo_login && (
                    <Label className="flex items-center justify-between space-x-3 rounded-lg border p-3 hover:bg-accent/40">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={accounts.demo_login} id="demo-target" />
                        <div>
                          <p className="font-semibold">{t("targetDemo")}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("loginLabel")}: {accounts.demo_login}
                          </p>
                        </div>
                      </div>
                    </Label>
                  )}
                  {accounts?.real_login && (
                    <Label className="flex items-center justify-between space-x-3 rounded-lg border p-3 hover:bg-accent/40">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={accounts.real_login} id="real-target" />
                        <div>
                          <p className="font-semibold">{t("targetReal")}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("loginLabel")}: {accounts.real_login}
                          </p>
                        </div>
                      </div>
                    </Label>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 inline-flex items-center gap-2"
                    onClick={loadAccounts}
                    type="button"
                    disabled={refreshing}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {refreshing ? t("refreshing") : t("refresh")}
                  </Button>
                </RadioGroup>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder={t("enterCurrent")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t("newPassword")}</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder={t("enterNew")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("confirmNew")}</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={t("confirmNew")}
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {t("saving")}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t("changePassword")}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
