// app/funds/withdrawal/history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/funds/withdrawal/history");
      const json = await res.json();
      if (json.success) {
        setList(json.data || []);
      }
    } catch (err) {
      console.error("Load failed");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id: number, rawAmount: number | string) => {
    const amount = Number(rawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid amount");
      return;
    }

    if (!confirm(`Cancel withdrawal of $${amount.toFixed(2)} and refund to your account?`)) return;

    try {
      const res = await fetch("/api/funds/withdrawal/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id }),
      });
      const json = await res.json();

      if (json.success) {
        alert("Withdrawal cancelled & amount refunded instantly!");
        // Update the status to cancelled, which will hide the cancel button
        setList(prev => prev.map(w => 
          w.Withdraw_ID === id ? { ...w, Status: "cancelled" } : w
        ));
      } else {
        alert(json.error || "Failed to cancel");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const formatTime = (t: string) => {
    return new Date(t).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (raw: number | string) => {
    const num = Number(raw);
    return isNaN(num) ? "—.–" : num.toFixed(2);
  };

  const getStatus = (s: string) => {
    switch (s.toLowerCase()) {
      case "pending": return <Badge variant="secondary">Pending</Badge>;
      case "processed":
      case "completed": return <Badge className="bg-green-600">Completed</Badge>;
      case "cancelled": return <Badge variant="outline">Cancelled</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">{s}</Badge>;
    }
  };

  return (
    <div className="page-wrapper min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto py-12 px-4 max-w-4xl">
        <div className="text-center mb-8">
          <ArrowUpCircle className="h-14 w-14 text-red-600 mx-auto mb-3" />
          <h1 className="text-3xl font-bold">Withdrawal History</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="h-10 w-10 animate-spin mx-auto" />
              </div>
            ) : list.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground text-lg">
                No withdrawal requests yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((w) => (
                    <TableRow key={w.Withdraw_ID}>
                      <TableCell className="font-mono font-bold">{w.ref}</TableCell>
                      <TableCell>{formatTime(w.Time)}</TableCell>
                      <TableCell className="font-bold">
                        ${formatAmount(w.Amount)}
                      </TableCell>
                      <TableCell>{w.BankName || "—"}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {w.BankNumber?.replace(/\d{4}(?=.)/g, "$& ") || "—"}
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
                              Cancel
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