import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export function ActionButtons() {
  return (
    <div className="flex gap-4">
      <Button className="flex-1 gap-2" size="lg">
        <ArrowDownToLine className="h-4 w-4" />
        Deposit
      </Button>
      <Button variant="outline" className="flex-1 gap-2" size="lg">
        <ArrowUpFromLine className="h-4 w-4" />
        Withdraw
      </Button>
    </div>
  );
}
