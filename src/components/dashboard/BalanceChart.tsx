"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useEffect, useState } from "react";

interface BalanceData {
  date: string;
  balance: number;
  timestamp: number;
}

export function BalanceChart() {
  const [data, setData] = useState<BalanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/balance-history');
        if (response.ok) {
          const historyData = await response.json();
          setData(historyData);
        }
      } catch (error) {
        console.error('Failed to fetch balance history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Balance History</CardTitle>
        </CardHeader>
        <CardContent className="pl-2 h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground">Loading chart data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Balance History</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] w-full [&_.recharts-surface]:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${formatNumber(value)}`}
              />
              <Tooltip 
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`$${formatNumber(value)}`, 'Balance']}
                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#2563eb" // Primary blue
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
