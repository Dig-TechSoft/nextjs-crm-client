"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserCircle, LogOut, Settings, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const router = useRouter();
  const [userLabel, setUserLabel] = useState<string>("Trader");

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Load logged-in user's display name/login for the header menu
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const name = data?.user?.Name || data?.user?.Login;
        if (name) setUserLabel(name);
      } catch (err) {
        console.error("Failed to load profile for header:", err);
      }
    };
    loadUser();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4 sm:px-6 gap-4">
        <div className="flex items-center gap-3 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56" sideOffset={8}>
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/">Dashboard</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/history">History</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/positions">Positions</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/funds/deposit">Deposit</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/funds/deposit/history">Deposit History</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/funds/withdrawal">Withdrawal</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/funds/withdrawal/history">Withdrawal History</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/images/flamycom.png" alt="Flamycom logo" width={190} height={50} className="h-10 w-auto" />
          </Link>
        </div>

        <div className="hidden md:flex md:items-center md:space-x-6 text-sm font-medium mr-auto">
          <Link href="/" className="flex items-center space-x-2 font-bold text-base">
            <Image src="/images/flamycom.png" alt="Flamycom logo" width={240} height={64} className="h-14 w-auto" />
          </Link>
          <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">
            Dashboard
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer" suppressHydrationWarning>
              Statistics
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild><Link href="/history">History</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/positions">Positions</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer" suppressHydrationWarning>
              Funds
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link href="/funds/deposit" className="flex items-center gap-2">
                  Deposit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/funds/deposit/history" className="flex items-center gap-2">
                  Deposit History
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/funds/withdrawal" className="flex items-center gap-2">
                  Withdrawal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/funds/withdrawal/history" className="flex items-center gap-2">
                  Withdrawal History
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/settings" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Settings
          </Link>
        </div>

        <nav className="flex items-center gap-2 ml-auto">
          <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2" suppressHydrationWarning>
                  <UserCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">{userLabel}</span>
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" suppressHydrationWarning>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
