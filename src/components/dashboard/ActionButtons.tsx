"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useEffect, useState } from "react";

export function ActionButtons() {
  const t = useTranslations("Dashboard.actions");
  const [accountType, setAccountType] = useState<"real" | "demo" | null>(null);
  const [demoLogin, setDemoLogin] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/accounts/list");
        const data = await res.json();
        if (data.success) {
          setAccountType(data.current_type);
          setDemoLogin(data.demo_login);
        }
      } catch (err) {
        console.error("Failed to load account type", err);
      }
    };
    load();
  }, []);

  if (accountType === "demo") {
    return (
      <div className="grid w-full gap-3 sm:grid-cols-1">
        <Button
          asChild
          size="lg"
          variant="outline"
          className="w-full gap-2 border-primary/40 text-primary hover:bg-primary/10"
        >
          <Link href="/demo/balance" className="flex items-center justify-center gap-2">
            <ArrowDownToLine className="h-4 w-4" />
            {t("setDemoBalance")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <Button
        asChild
        size="lg"
        className="w-full gap-2 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground shadow-md hover:shadow-lg"
      >
        <Link href="/funds/deposit" className="flex items-center justify-center gap-2">
          <ArrowDownToLine className="h-4 w-4" />
          {t("deposit")}
        </Link>
      </Button>
      <Button
        asChild
        size="lg"
        variant="outline"
        className="w-full gap-2 border-primary/40 text-primary hover:bg-primary/10"
      >
        <Link href="/funds/withdrawal" className="flex items-center justify-center gap-2">
          <ArrowUpFromLine className="h-4 w-4" />
          {t("withdraw")}
        </Link>
      </Button>
    </div>
  );
}
