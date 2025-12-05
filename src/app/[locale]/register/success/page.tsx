"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function RegisterSuccessPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const t = useTranslations("RegisterSuccess");
  const router = useRouter();
  const locale = useLocale();

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
            {t("message", { email: email || t("emailPlaceholder") })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" onClick={() => router.push(`/${locale}/login`)}>
            {t("ctaLogin")}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push(`/${locale}/register`)}
          >
            {t("ctaBack")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
