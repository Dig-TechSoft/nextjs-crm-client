import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export function ActionButtons() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <Button
        asChild
        size="lg"
        className="w-full gap-2 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground shadow-md hover:shadow-lg"
      >
        <Link href="/funds/deposit" className="flex items-center justify-center gap-2">
          <ArrowDownToLine className="h-4 w-4" />
          Deposit Funds
        </Link>
      </Button>
      <Button
        asChild
        size="lg"
        variant="outline"
        className="w-full gap-2 border-primary/40 text-primary hover:bg-primary/10"
      >
        <Link href="/funds/withdrawal" className="flex items-center justify-center gap-2">
          <ArrowUpFromLine className="h-4 w-4" />
          Withdraw Funds
        </Link>
      </Button>
    </div>
  );
}
