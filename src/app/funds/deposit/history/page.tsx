"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ArrowDownCircle, CheckCircle2, XCircle, Clock, RefreshCw, Loader2 } from "lucide-react";

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

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/funds/deposit/history");
      const json = await res.json();
      if (json.success) {
        setDeposits(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load deposits");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDeposits();
  }, []);

  const formatAmount = (raw: number | string) => {
    const num = Number(raw);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const formatTime = (t: string) => {
    return new Date(t).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
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
          <h1 className="text-4xl font-bold">Deposit History</h1>
          <p className="text-muted-foreground mt-2">
            Track all your deposit requests
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Deposits</CardTitle>
              <Button onClick={loadDeposits} size="sm" variant="outline" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-4">Loading deposits...</p>
              </div>
            ) : deposits.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <ArrowDownCircle className="h-20 w-20 mx-auto mb-6 opacity-20" />
                <p className="text-lg">No deposit requests yet</p>
                <p className="text-sm mt-2">Your deposits will appear here</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deposits.map((d) => (
                      <TableRow key={d.Receipt_ID}>
                        <TableCell className="whitespace-nowrap">
                          {formatTime(d.Time)}
                        </TableCell>
                        <TableCell className="font-bold text-lg">
                          ${formatAmount(d.Amount)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {d.PaymentMethod || "—"}
                        </TableCell>
                        <TableCell>{getStatusBadge(d.Status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {deposits.length > 0 && (
              <div className="mt-8 text-center text-sm text-muted-foreground">
                Approved deposits are credited instantly • Pending requests are under review
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}