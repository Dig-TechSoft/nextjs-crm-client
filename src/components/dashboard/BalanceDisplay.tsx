import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccountData {
  Login: string;
  Balance: string;
  Credit: string;
  Margin: string;
  MarginFree: string;
  MarginLevel: string;
  Equity: string;
  Profit: string;
  Floating: string;
}

export function BalanceDisplay({ data }: { data: AccountData }) {
  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(value));
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium">Account Overview</CardTitle>
        <div className="text-xs text-muted-foreground">Account: {data.Login}</div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Balance</span>
            <span className="text-lg font-bold">{formatCurrency(data.Balance)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Equity</span>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(data.Equity)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Margin</span>
            <span className="text-sm font-medium">{formatCurrency(data.Margin)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Free Margin</span>
            <span className="text-sm font-medium">{formatCurrency(data.MarginFree)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Margin Level</span>
            <span className="text-sm font-medium">{Number(data.MarginLevel).toFixed(2)}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Credit</span>
            <span className="text-sm font-medium">{formatCurrency(data.Credit)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
