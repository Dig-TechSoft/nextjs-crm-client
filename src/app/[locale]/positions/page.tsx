"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { TrendingUp, TrendingDown, Clock, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

interface Position {
  position: number;
  login: number;
  timecreate: string;
  symbol: string;
  profit: number;
  storage: number;
  priceopen: number;
  pricesl: number;
  pricetp: number;
  pricecurrent: number;
  volume: number;
}


export default function PositionsPage() {
  const t = useTranslations("Positions");
  const tCommon = useTranslations("Common");
  const format = useFormatter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add this refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setCurrentPage(1); // optional: reset to first page
    await fetchPositions();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const res = await fetch('/api/deals/positions');
      const data = await res.json();

      if (data.success) {
        setPositions(data.positions);
      } else {
        setError(data.error || "Failed to load positions");
      }
    } catch (err) {
      setError("An error occurred while loading positions");
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

  const totalProfit = positions.reduce((sum, pos) => sum + pos.profit, 0);
  const totalStorage = positions.reduce((sum, pos) => sum + pos.storage, 0);
  const openPositions = positions.length;

  // Pagination calculations
  const totalPages = Math.ceil(positions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPositions = positions.slice(startIndex, endIndex);

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
              <p className="text-muted-foreground">Loading positions...</p>
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
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? t("refreshing") : t("refresh")}</span>
          </Button>
        </div>
        <p className="text-muted-foreground">
          {t("overview")}
        </p>
      </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("floatingPL")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalProfit)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("fromOpen", { count: openPositions })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("totalStorage")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalStorage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalStorage)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("accumulatedSwapStorage")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("openPositions")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openPositions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("openPositions")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Positions Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("allPositions")}</CardTitle>
            <CardDescription>
              {t("details")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {positions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("noPositions")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">{t("table.time")}</th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">{t("table.symbol")}</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">{t("table.volume")}</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">{t("table.openPrice")}</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">{t("table.currentPrice")}</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">{t("table.sl")}</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">{t("table.tp")}</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">{t("table.profit")}</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">{t("table.storage")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPositions.map((pos) => (
                        <tr 
                          key={pos.position} 
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm">
                            {formatDate(pos.timecreate)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">{pos.symbol}</span>
                          </td>
                          <td className="py-3 px-4 text-right text-sm">
                            {Number(pos.volume).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-mono">
                            {pos.priceopen.toFixed(5)}
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-mono">
                            {pos.pricecurrent.toFixed(5)}
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-mono text-muted-foreground">
                            {pos.pricesl > 0 ? pos.pricesl.toFixed(5) : '-'}
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-mono text-muted-foreground">
                            {pos.pricetp > 0 ? pos.pricetp.toFixed(5) : '-'}
                          </td>
                          <td className={`py-3 px-4 text-right font-semibold ${
                            pos.profit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(pos.profit)}
                          </td>
                          <td className={`py-3 px-4 text-right text-sm ${
                            pos.storage >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(pos.storage)}
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
                      {tCommon("showing", { start: startIndex + 1, end: Math.min(endIndex, positions.length), total: positions.length })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {tCommon("previous")}
                      </Button>
                      <div className="text-sm font-medium">
                        {tCommon("page", { current: currentPage, total: totalPages })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        {tCommon("next")}
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
