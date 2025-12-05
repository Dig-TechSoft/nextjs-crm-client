"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const t = useTranslations("Register");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidPassword = (value: string) => {
    const pattern =
      /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*._-])[A-Za-z0-9!@#$%^&*._-]{8,12}$/;
    return pattern.test(value);
  };

  const getPasswordStrength = (value: string) => {
    const lengthOk = /^.{8,12}$/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*._-]/.test(value);
    const score =
      (lengthOk ? 1 : 0) +
      (hasLower ? 1 : 0) +
      (hasUpper ? 1 : 0) +
      (hasNumber ? 1 : 0) +
      (hasSpecial ? 1 : 0);

    if (!value) {
      return { score: 0, labelKey: "strengthWeak", color: "bg-muted" };
    }
    if (score <= 2) {
      return { score, labelKey: "strengthWeak", color: "bg-red-500" };
    }
    if (score === 3 || score === 4) {
      return { score, labelKey: "strengthMedium", color: "bg-yellow-500" };
    }
    return { score, labelKey: "strengthStrong", color: "bg-green-500" };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (!isValidPassword(password)) {
      setError(t("passwordRequirements"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, locale }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(
          `/${locale}/register/success?email=${encodeURIComponent(email)}`
        );
      } else {
        setError(data.message || t("error"));
      }
    } catch (err) {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
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
          <CardDescription className="text-center">
            {t("subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                {t("passwordHint")}
              </p>
              {password && (
                <div className="space-y-1">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full transition-all duration-200 ${getPasswordStrength(password).color}`}
                      style={{ width: `${getPasswordStrength(password).score * 20}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("passwordStrength", {
                      strength: t(getPasswordStrength(password).labelKey),
                    })}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 font-medium text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-600 font-medium text-center">
                {success}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("submitting") : t("registerButton")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={() => router.push(`/${locale}/login`)}
            >
              {t("backToLogin")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
