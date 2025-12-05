"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatter, useTranslations } from "next-intl";
import { AccountSwitcher } from "./AccountSwitcher";

interface AccountData {
  Login: string;
  Balance: string;
  Credit: string;
  Margin: string;
  MarginFree: string;
  MarginLevel: string;
  Equity: string;
  Profit: string;
  Floating: string;
}

export function BalanceDisplay({ data }: { data: AccountData }) {
  const t = useTranslations("Dashboard.balanceDisplay");
  const format = useFormatter();

  const formatCurrency = (value: string | number) =>
    format.number(Number(value), {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium">{t("title")}</CardTitle>
        <AccountSwitcher currentLogin={data.Login} />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{t("balance")}</span>
            <span className="text-lg font-bold">{formatCurrency(data.Balance)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{t("equity")}</span>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(data.Equity)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{t("margin")}</span>
            <span className="text-sm font-medium">{formatCurrency(data.Margin)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{t("freeMargin")}</span>
            <span className="text-sm font-medium">{formatCurrency(data.MarginFree)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{t("marginLevel")}</span>
            <span className="text-sm font-medium">
              {format.number(Number(data.MarginLevel), {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
              %
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{t("credit")}</span>
            <span className="text-sm font-medium">{formatCurrency(data.Credit)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
