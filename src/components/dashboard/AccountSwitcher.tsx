"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, RefreshCcw, Laptop2 } from "lucide-react";
import clsx from "clsx";

type AccountsResponse = {
  success: boolean;
  real_login: string | null;
  demo_login: string | null;
  current_login: string;
  current_type: "real" | "demo" | null;
};

export function AccountSwitcher({ currentLogin }: { currentLogin: string }) {
  const [accounts, setAccounts] = useState<AccountsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts/list");
      const data = await res.json();
      if (data.success) {
        setAccounts(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSwitch = async (login: string) => {
    if (!login || accounts?.current_login === login) return;
    setSwitching(true);
    try {
      await fetch("/api/accounts/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login }),
      });
      window.location.reload();
    } finally {
      setSwitching(false);
    }
  };

  const label = (() => {
    if (!accounts) return "Account";
    const typeLabel =
      accounts.current_type === "real"
        ? "Live"
        : accounts.current_type === "demo"
        ? "Demo"
        : "Account";
    return `${typeLabel}: ${accounts.current_login}`;
  })();

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={clsx(
              "inline-flex items-center gap-2 h-8 px-3 rounded-full text-xs font-semibold text-primary border border-transparent hover:bg-accent/40 transition-colors",
              loading && "opacity-70"
            )}
            disabled={loading}
            aria-label="Switch account"
          >
            <Laptop2 className="h-4 w-4" />
            <span>{label}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs">Switch account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {accounts?.demo_login && (
            <DropdownMenuItem
              className={clsx(
                "text-sm",
                accounts.current_login === accounts.demo_login && "text-primary font-semibold"
              )}
              onClick={() => handleSwitch(accounts.demo_login!)}
            >
              Demo • {accounts.demo_login}
            </DropdownMenuItem>
          )}
          {accounts?.real_login ? (
            <DropdownMenuItem
              className={clsx(
                "text-sm",
                accounts.current_login === accounts.real_login && "text-primary font-semibold"
              )}
              onClick={() => handleSwitch(accounts.real_login!)}
            >
              Live • {accounts.real_login}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-sm text-primary font-semibold"
              onClick={() => {
                window.location.href = "/verification";
              }}
            >
              Live: verify to create
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={load}
        disabled={loading}
        aria-label="Refresh accounts"
      >
        <RefreshCcw className={clsx("h-4 w-4", loading && "animate-spin")} />
      </Button>
    </div>
  );
}
