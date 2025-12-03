// app/funds/deposit/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Header } from "@/components/layout/Header";
import { Upload, Wallet, Copy, Check, ArrowDownCircle } from "lucide-react";

export default function DepositRequestPage() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankDetails = {
    bankName: "Bank Asia",
    accountNumber: "1234 5678 9012 3456",
    accountHolder: "TRADING CORP",
  };

  const cryptoDetails = {
    network: "TRC-20 (Tether USDT)",
    address: "TLaF6i2GkR7vT4K7Np3m8v9cX8yZk9pQrT",
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!amount || !method || !file || (method === "crypto_usdt" && !usdtAmount)) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("paymentMethod", method);
    if (method === "crypto_usdt") {
      formData.append("usdtAmount", usdtAmount);
    }
    formData.append("file", file);

    try {
      const res = await fetch("/api/funds/deposit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setAmount("");
        setMethod("");
        setUsdtAmount("");
        setFile(null);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <ArrowDownCircle className="h-14 w-14 sm:h-16 sm:w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold">Deposit Request</h1>
            <p className="text-muted-foreground mt-2">
              Submit your manual transfer proof for fast crediting
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Submit Transfer Proof</CardTitle>
              <CardDescription>
                Deposit will be credited after verification - usually within 5-30 minutes.
              </CardDescription>
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
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={method} onValueChange={setMethod} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transfer method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer (Local)</SelectItem>
                    <SelectItem value="crypto_usdt">USDT TRC-20</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {method && (
                <Button variant="outline" className="w-full" onClick={() => setShowDetails(true)} disabled={loading}>
                  <Wallet className="mr-2 h-4 w-4" />
                  View {method === "bank_transfer" ? "Bank" : "Wallet"} Details
                </Button>
              )}

              {method === "crypto_usdt" && (
                <div className="space-y-2">
                  <Label htmlFor="usdtAmount">USDT Amount Sent</Label>
                  <Input
                    id="usdtAmount"
                    type="number"
                    placeholder="100.00"
                    value={usdtAmount}
                    onChange={(e) => setUsdtAmount(e.target.value)}
                    step="0.01"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter exact amount including decimals
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Upload Proof of Payment</Label>
                <label
                  htmlFor="file-upload"
                  className="block border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5"
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  {file ? (
                    <div>
                      <p className="font-medium text-primary break-words">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">Click to upload receipt</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PNG, JPG, PDF - Max 10MB
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-600 bg-green-50">
                  <AlertDescription className="text-green-700 font-medium">
                    Deposit request submitted successfully! We are reviewing your proof.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={!amount || !method || !file || loading || (method === "crypto_usdt" && !usdtAmount)}
              >
                {loading ? (
                  "Submitting..."
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Submit Deposit Request
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Minimum deposit: $10 | No fees | Fast processing
              </p>
            </CardContent>
          </Card>

          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="sm:max-w-md max-w-[92vw]">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {method === "bank_transfer" ? "Bank Transfer Details" : "USDT TRC-20 Wallet"}
                </DialogTitle>
                <DialogDescription>
                  {method === "bank_transfer"
                    ? "Transfer exactly to this account"
                    : "Send only via TRC-20 network"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {method === "bank_transfer" ? (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">Bank</span>
                      <span className="text-sm sm:text-base">{bankDetails.bankName}</span>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">Account No.</span>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm break-all">{bankDetails.accountNumber}</code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleCopy(bankDetails.accountNumber, "bank")}
                        >
                          {copiedField === "bank" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">Holder</span>
                      <span className="text-sm sm:text-base">{bankDetails.accountHolder}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-orange-50 border border-orange-300 rounded-lg text-center">
                      <p className="font-bold text-orange-800">TRC-20 Network Only!</p>
                      <p className="text-xs text-orange-700 mt-1">Other networks = permanent loss</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg space-y-3">
                      <p className="text-sm font-medium">Wallet Address</p>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                        <code className="font-mono text-sm break-all bg-background px-3 py-2 rounded flex-1">
                          {cryptoDetails.address}
                        </code>
                        <Button
                          size="icon"
                          className="h-10 w-10 shrink-0"
                          onClick={() => handleCopy(cryptoDetails.address, "crypto")}
                        >
                          {copiedField === "crypto" ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        Network: {cryptoDetails.network}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
