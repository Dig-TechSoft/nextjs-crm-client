"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/layout/Header";
import { ArrowUpCircle, AlertCircle, CheckCircle2 } from "lucide-react";

export default function WithdrawalPage() {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // Call API to save request to database
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <ArrowUpCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold">Withdrawal Request</h1>
            <p className="text-muted-foreground mt-2">Submit request • Reviewed by admin within 24 hours</p>
          </div>

          {submitted ? (
            <Card className="border-green-600">
              <CardContent className="pt-10 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Request Submitted!</h2>
                <p className="text-muted-foreground mt-2">
                  Your withdrawal request for <strong>${amount}</strong> has been sent for review.
                  You will receive confirmation via email.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Details</CardTitle>
                <CardDescription>
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  All withdrawals are processed manually for security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Amount to Withdraw (USD)</Label>
                  <Input
                    type="number"
                    placeholder="500.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input value={bankName} onChange={(e) => setBankName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Account Holder Name</Label>
                  <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Note (Optional)</Label>
                  <Textarea
                    placeholder="Any additional information..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Processing time: 1–24 hours • Minimum withdrawal: $50
                  </AlertDescription>
                </Alert>

                <Button
                  className="w-full"
                  size="lg"
                  variant="destructive"
                  onClick={handleSubmit}
                  disabled={!amount || !bankName || !accountNumber || !accountName || loading}
                >
                  {loading ? "Submitting..." : "Submit Withdrawal Request"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}