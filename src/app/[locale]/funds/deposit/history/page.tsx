"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ArrowDownCircle, CheckCircle2, Clock, Loader2, RefreshCw, XCircle } from "lucide-react";

interface Deposit {
  Receipt_ID: number;
  Amount: number | string;
  Status: "pending" | "approved" | "rejected";
  Time: string;
  PaymentMethod: string;
}

export default function DepositHistory() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("FundsHistory.deposit");
  const format = useFormatter();

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/funds/deposit/history");
      const json = await res.json();
      if (json.success) {
        setDeposits(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load deposits", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDeposits();
  }, []);

  const formatAmount = (raw: number | string) => {
    const num = Number(raw);
    if (isNaN(num)) return "0.00";
    return format.number(num, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  };

  const formatTime = (t: string) =>
    format.dateTime(new Date(t), {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {t("status.approved")}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            {t("status.pending")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            {t("status.rejected")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <ArrowDownCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t("recent")}</CardTitle>
              <Button onClick={loadDeposits} size="sm" variant="outline" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {t("refresh")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-4">{t("loading")}</p>
              </div>
            ) : deposits.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <ArrowDownCircle className="h-20 w-20 mx-auto mb-6 opacity-20" />
                <p className="text-lg">{t("emptyTitle")}</p>
                <p className="text-sm mt-2">{t("emptySubtitle")}</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("table.date")}</TableHead>
                      <TableHead>{t("table.amount")}</TableHead>
                      <TableHead>{t("table.method")}</TableHead>
                      <TableHead>{t("table.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deposits.map((d) => (
                      <TableRow key={d.Receipt_ID}>
                        <TableCell className="whitespace-nowrap">{formatTime(d.Time)}</TableCell>
                        <TableCell className="font-bold text-lg">{formatAmount(d.Amount)}</TableCell>
                        <TableCell className="font-medium">
                          {d.PaymentMethod || t("unknownMethod")}
                        </TableCell>
                        <TableCell>{getStatusBadge(d.Status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {deposits.length > 0 && (
              <div className="mt-8 text-center text-sm text-muted-foreground">{t("note")}</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
