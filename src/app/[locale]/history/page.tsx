"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { TrendingUp, TrendingDown, Clock, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";

interface Deal {
  deal: number;
  login: number;
  time: string;
  symbol: string;
  profit: number;
  priceposition: number;
  pricesl: number;
  pricetp: number;
  marketbid: number;
  marketask: number;
  volume: number;
}

export default function HistoryPage() {
  const t = useTranslations('History');
  const tCommon = useTranslations('Common');
  const format = useFormatter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/deals/history');
      const data = await res.json();

      if (data.success) {
        setDeals(data.deals);
      } else {
        setError(data.error || tCommon('error'));
      }
    } catch (err) {
      setError(tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    format.dateTime(new Date(dateString), {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const formatCurrency = (value: number) =>
    format.number(value, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });

  const totalProfit = deals.reduce((sum, deal) => sum + deal.profit, 0);
  const profitableDeals = deals.filter(d => d.profit > 0).length;
  const losingDeals = deals.filter(d => d.profit < 0).length;

  // Pagination calculations
  const totalPages = Math.ceil(deals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDeals = deals.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto py-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{tCommon('loading')}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto py-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <p className="text-center text-red-500">{error}</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('overview')}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalPL')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalProfit)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('fromTrades', {count: deals.length})}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('profitableTrades')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{profitableDeals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('winRate', {rate: deals.length > 0 ? ((profitableDeals / deals.length) * 100).toFixed(1) : 0})}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('losingTrades')}</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{losingDeals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('lossRate', {rate: deals.length > 0 ? ((losingDeals / deals.length) * 100).toFixed(1) : 0})}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trading History Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('allTrades')}</CardTitle>
            <CardDescription>
              {t('historyDetails')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('noHistory')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">{t('table.time')}</th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">{t('table.symbol')}</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">{t('table.volume')}</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">{t('table.entryPrice')}</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">{t('table.sl')}</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">{t('table.tp')}</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">{t('table.pl')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDeals.map((deal) => (
                        <tr 
                          key={deal.deal} 
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm">
                            {formatDate(deal.time)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">{deal.symbol}</span>
                          </td>
                          <td className="py-3 px-4 text-right text-sm">
                            {Number(deal.volume).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-mono">
                            {deal.priceposition.toFixed(5)}
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-mono text-muted-foreground">
                            {deal.pricesl > 0 ? deal.pricesl.toFixed(5) : '-'}
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-mono text-muted-foreground">
                            {deal.pricetp > 0 ? deal.pricetp.toFixed(5) : '-'}
                          </td>
                          <td className={`py-3 px-4 text-right font-semibold ${
                            deal.profit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(deal.profit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-muted-foreground">
                      {tCommon('showing', {start: startIndex + 1, end: Math.min(endIndex, deals.length), total: deals.length})}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {tCommon('previous')}
                      </Button>
                      <div className="text-sm font-medium">
                        {tCommon('page', {current: currentPage, total: totalPages})}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        {tCommon('next')}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
