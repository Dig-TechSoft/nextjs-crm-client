// app/funds/deposit/page.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations('Funds');
  const tCommon = useTranslations('Common');
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
      setError(tCommon('error'));
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
        setError(data.error || tCommon('error'));
      }
    } catch (err) {
      setError(tCommon('error'));
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
            <h1 className="text-3xl sm:text-4xl font-bold">{t('depositRequest')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('submitProof')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('submitTitle')}</CardTitle>
              <CardDescription>
                {t('submitDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">{t('amount')}</Label>
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
                <Label>{t('paymentMethod')}</Label>
                <Select value={method} onValueChange={setMethod} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectMethod')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">{t('bankTransfer')}</SelectItem>
                    <SelectItem value="crypto_usdt">{t('cryptoUsdt')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {method && (
                <Button variant="outline" className="w-full" onClick={() => setShowDetails(true)} disabled={loading}>
                  <Wallet className="mr-2 h-4 w-4" />
                  {t('viewDetails', {method: method === "bank_transfer" ? t('bank') : t('wallet')})}
                </Button>
              )}

              {method === "crypto_usdt" && (
                <div className="space-y-2">
                  <Label htmlFor="usdtAmount">{t('usdtAmount')}</Label>
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
                    {t('enterExact')}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t('uploadProof')}</Label>
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
                      <p className="font-medium">{t('clickUpload')}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('maxSize')}
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
                    {t('successTitle')} {t('successDesc')}
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
                  t('submitting')
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    {t('submitButton')}
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {t('minDeposit')}
              </p>
            </CardContent>
          </Card>

          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="sm:max-w-md max-w-[92vw]">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {method === "bank_transfer" ? t('bankTransfer') : t('cryptoUsdt')}
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
                      <span className="font-medium">{t('bankName')}</span>
                      <span className="text-sm sm:text-base">{bankDetails.bankName}</span>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{t('accountNumber')}</span>
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
                      <span className="font-medium">{t('accountHolder')}</span>
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
