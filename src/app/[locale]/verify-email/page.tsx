"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyEmailPage() {
  const t = useTranslations("VerifyEmail");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const pwd = searchParams.get("pwd");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage(t("missingToken"));
        return;
      }
      if (!pwd) {
        setStatus("error");
        setMessage(t("error"));
        return;
      }

      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, passwordEncoded: pwd }),
        });
        const data = await res.json();
        if (data.success) {
          setStatus("success");
          setMessage(data.message || t("success"));
        } else {
          setStatus("error");
          setMessage(data.message || t("error"));
        }
      } catch (err) {
        setStatus("error");
        setMessage(t("error"));
      }
    };

    verify();
  }, [token, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
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
          <CardDescription className="text-center" />
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "loading" && (
            <div className="text-sm text-muted-foreground">
              {t("verifying")}
            </div>
          )}
          {status === "success" && (
            <div className="text-sm text-green-600 font-medium">{message}</div>
          )}
          {status === "error" && (
            <div className="text-sm text-red-500 font-medium">{message}</div>
          )}
          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={() => router.push(`/${locale}/login`)}
            >
              {t("ctaLogin")}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push(`/${locale}/register`)}
            >
              {t("ctaRegister")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
