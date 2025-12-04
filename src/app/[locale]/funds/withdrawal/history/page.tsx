"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ArrowUpCircle, Loader2 } from "lucide-react";

interface Withdrawal {
  Withdraw_ID: number;
  Amount: number | string;
  BankName: string;
  BankNumber: string;
  Status: string;
  Time: string;
  ref: string;
  cancelwithdrawdeal?: string | null;
}

export default function WithdrawalHistory() {
  const [list, setList] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("FundsHistory.withdrawal");
  const format = useFormatter();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/funds/withdrawal/history");
      const json = await res.json();
      if (json.success) {
        setList(json.data || []);
      }
    } catch (err) {
      console.error("Load failed", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const formatTime = (t: string) =>
    format.dateTime(new Date(t), {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const formatAmount = (raw: number | string) => {
    const num = Number(raw);
    if (isNaN(num)) return "0.00";
    return format.number(num, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  };

  const cancel = async (id: number, rawAmount: number | string) => {
    const numAmount = Number(rawAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert(t("invalidAmount"));
      return;
    }

    const formattedAmount = formatAmount(numAmount);

    if (!confirm(t("cancelConfirm", { amount: formattedAmount }))) return;

    try {
      const res = await fetch("/api/funds/withdrawal/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id }),
      });
      const json = await res.json();

      if (json.success) {
        alert(t("cancelSuccess"));
        setList((prev) =>
          prev.map((w) =>
            w.Withdraw_ID === id ? { ...w, Status: "cancelled" } : w
          )
        );
      } else {
        alert(json.error || t("cancelFail"));
      }
    } catch (err) {
      alert(t("networkError"));
    }
  };

  const getStatus = (s: string) => {
    switch (s.toLowerCase()) {
      case "pending":
        return <Badge variant="secondary">{t("status.pending")}</Badge>;
      case "transferred":
        return (
          <Badge className="bg-green-600">{t("status.transferred")}</Badge>
        );
      case "completed":
        return <Badge className="bg-green-600">{t("status.completed")}</Badge>;
      case "cancelled":
        return <Badge variant="outline">{t("status.cancelled")}</Badge>;
      case "rejected":
        return <Badge variant="destructive">{t("status.rejected")}</Badge>;
      default:
        return <Badge variant="outline">{s}</Badge>;
    }
  };

  return (
    <div className="page-wrapper min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto py-12 px-4 max-w-4xl">
        <div className="text-center mb-8">
          <ArrowUpCircle className="h-14 w-14 text-red-600 mx-auto mb-3" />
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("recent")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="h-10 w-10 animate-spin mx-auto" />
              </div>
            ) : list.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground text-lg">
                {t("empty")}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.reference")}</TableHead>
                    <TableHead>{t("table.date")}</TableHead>
                    <TableHead>{t("table.amount")}</TableHead>
                    <TableHead>{t("table.bank")}</TableHead>
                    <TableHead>{t("table.account")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((w) => (
                    <TableRow key={w.Withdraw_ID}>
                      <TableCell className="font-mono font-bold">
                        {w.ref || t("unknownRef")}
                      </TableCell>
                      <TableCell>{formatTime(w.Time)}</TableCell>
                      <TableCell className="font-bold">
                        {formatAmount(w.Amount)}
                      </TableCell>
                      <TableCell>{w.BankName || t("unknownBank")}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {w.BankNumber?.replace(/\d{4}(?=.)/g, "$& ") ||
                          t("unknownAccount")}
                      </TableCell>
                      <TableCell className="w-[200px]">
                        <div className="flex items-center justify-between gap-3">
                          {getStatus(w.Status)}
                          {w.Status.toLowerCase() === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                              onClick={() => cancel(w.Withdraw_ID, w.Amount)}
                            >
                              {t("cancelButton")}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
