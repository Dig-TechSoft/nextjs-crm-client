"use client"

import * as React from "react";
import { Moon, Sun, SunMoon, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const t = useTranslations("Common.theme");

  React.useEffect(() => setMounted(true), []);

  const renderIcon = () => {
    if (!mounted) return <SunMoon className="h-4 w-4 text-primary" />;
    if (theme === "system") return <SunMoon className="h-4 w-4 text-primary" />;
    if (resolvedTheme === "light") return <Sun className="h-4 w-4 text-primary" />;
    if (resolvedTheme === "dark") return <Moon className="h-4 w-4 text-primary" />;
    return <SunMoon className="h-4 w-4 text-primary" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full p-0 transition-all hover:bg-accent/60 data-[state=open]:bg-accent/70"
        >
          {renderIcon()}
          <span className="sr-only">{t("toggleLabel")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>{t("light")}</span>
          {mounted && resolvedTheme === "light" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>{t("dark")}</span>
          {mounted && resolvedTheme === "dark" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <SunMoon className="mr-2 h-4 w-4" />
          <span>{t("system")}</span>
          {mounted && theme === "system" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
