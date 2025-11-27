"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { TrendingUp, TrendingDown, Clock, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

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
          <h2 className="text-3xl font-bold tracking-tight">Open Positions</h2>
          <p className="text-muted-foreground">
            Overview of your current open trading positions.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Floating P/L</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalProfit)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {openPositions} open positions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalStorage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalStorage)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Accumulated swap/storage fees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openPositions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently active trades
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Positions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Open Positions</CardTitle>
            <CardDescription>
              Details of your current open trades
            </CardDescription>
          </CardHeader>
          <CardContent>
            {positions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No open positions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Open Time</th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Symbol</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Volume</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Open Price</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Current Price</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">SL</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">TP</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Profit</th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Storage</th>
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
                      Showing {startIndex + 1} to {Math.min(endIndex, positions.length)} of {positions.length} positions
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="text-sm font-medium">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
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