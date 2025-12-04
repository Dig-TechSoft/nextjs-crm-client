"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/layout/Header";
import { ArrowDownCircle, CreditCard, Wallet } from "lucide-react";

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDeposit = async () => {
    if (!amount || !method) return;

    setLoading(true);
    setSuccess(false);

    // Simulate payment gateway redirect
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // In real app: redirect to actual gateway (e.g. Midtrans, Xendit, Stripe)
      // window.location.href = `https://gateway.com/pay?amount=${amount}&method=${method}`
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <ArrowDownCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold">Deposit Funds</h1>
            <p className="text-muted-foreground mt-2">Add funds instantly via secure payment gateway</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Choose Amount & Payment Method</CardTitle>
              <CardDescription>Your deposit will be credited immediately after payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Deposit Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="10"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer (VA)</SelectItem>
                    <SelectItem value="credit_card">Credit/Debit Card</SelectItem>
                    <SelectItem value="e_wallet">E-Wallet (GoPay, OVO, DANA)</SelectItem>
                    <SelectItem value="qr">QRIS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {success && (
                <Alert className="border-green-600">
                  <AlertDescription className="text-green-600 font-medium">
                    Redirecting to payment gateway...
                  </AlertDescription>
                </Alert>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleDeposit}
                disabled={!amount || !method || loading}
              >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Continue to Payment
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <Wallet className="inline h-4 w-4 mr-1" />
                Minimum deposit: $10.00 • No fees applied
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}