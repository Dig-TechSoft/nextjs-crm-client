"use client";

import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
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
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale, useTranslations } from "next-intl";

export function Header() {
  const router = useRouter();
  const t = useTranslations('Navigation');
  const tActions = useTranslations('Dashboard.actions');
  const locale = useLocale();
  const [userLabel, setUserLabel] = useState<string>("Trader");
  const [mounted, setMounted] = useState(false);
  const [accountType, setAccountType] = useState<"real" | "demo" | null>(null);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadAccountType = async () => {
      try {
        const res = await fetch("/api/accounts/list");
        const data = await res.json();
        if (data.success) {
          setAccountType(data.current_type);
        }
      } catch (err) {
        console.error("Failed to load account type for header", err);
      }
    };
    loadAccountType();
  }, []);

  if (!mounted) {
    return null;
  }

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
            <DropdownMenuContent
              align="start"
              className="w-56"
              sideOffset={8}
              suppressHydrationWarning
            >
              <DropdownMenuLabel>{t('menuLabel')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/" locale={locale}>{t('dashboard')}</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/history" locale={locale}>{t('history')}</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/positions" locale={locale}>{t('positions')}</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              {accountType !== "demo" && (
                <>
                  <DropdownMenuItem asChild><Link href="/funds/deposit" locale={locale}>{t('deposit')}</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/funds/deposit/history" locale={locale}>{t('depositHistory')}</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/funds/withdrawal" locale={locale}>{t('withdrawal')}</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/funds/withdrawal/history" locale={locale}>{t('withdrawalHistory')}</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {accountType === "demo" && (
                <DropdownMenuItem asChild><Link href="/demo/balance" locale={locale}>{tActions('setDemoBalance')}</Link></DropdownMenuItem>
              )}
              <DropdownMenuItem asChild><Link href="/settings" locale={locale}>{t('settings')}</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/" locale={locale} className="flex items-center space-x-2">
            <Image src="/images/flamycom.png" alt="Flamycom logo" width={160} height={44} className="h-10 w-auto" />
          </Link>
        </div>

        <div className="hidden md:flex md:items-center md:space-x-6 text-sm font-medium mr-auto">
          <Link href="/" locale={locale} className="flex items-center space-x-2 font-bold text-base">
            <Image src="/images/flamycom.png" alt="Flamycom logo" width={240} height={64} className="h-14 w-auto" />
          </Link>
          <Link href="/" locale={locale} className="transition-colors hover:text-foreground/80 text-foreground">
            {t('dashboard')}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer" suppressHydrationWarning>
              {t('statistics')}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild><Link href="/history" locale={locale}>{t('history')}</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/positions" locale={locale}>{t('positions')}</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer" suppressHydrationWarning>
              {t('funds')}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {accountType !== "demo" && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/funds/deposit" locale={locale} className="flex items-center gap-2">
                      {t('deposit')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/funds/deposit/history" locale={locale} className="flex items-center gap-2">
                      {t('depositHistory')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/funds/withdrawal" locale={locale} className="flex items-center gap-2">
                      {t('withdrawal')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/funds/withdrawal/history" locale={locale} className="flex items-center gap-2">
                      {t('withdrawalHistory')}
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              {accountType === "demo" && (
                <DropdownMenuItem asChild>
                  <Link href="/demo/balance" locale={locale} className="flex items-center gap-2">
                    {tActions('setDemoBalance')}
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/settings" locale={locale} className="transition-colors hover:text-foreground/80 text-foreground/60">
            {t('settings')}
          </Link>
        </div>

        <nav className="flex items-center gap-2 ml-auto">
          <LanguageSwitcher />
          <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  suppressHydrationWarning
                  aria-label="User menu"
                >
                  <UserCircle className="h-5 w-5" />
                  <span className="text-sm font-medium hidden sm:inline">{userLabel}</span>
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" suppressHydrationWarning>
              <DropdownMenuLabel>{t('userMenu')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" locale={locale} className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('profile')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" locale={locale} className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('settings')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
