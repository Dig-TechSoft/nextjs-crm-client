"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();

      if (data.success && data.valid) {
        router.push("/");
      } else {
        // Extract message from "CODE Message" format (e.g., "3006 Invalid account password")
        const errorMessage = data.retcode
          ? data.retcode.replace(/^\d+\s+/, "") // Remove error code prefix
          : "Login failed";
        setError(errorMessage);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center gap-3">
            <Image
              src="/images/flamycom.png"
              alt="Flamycom logo"
              width={420}
              height={118}
              className="h-20 w-auto"
            />
            <CardTitle className="text-2xl font-bold text-center">
              Account Login
            </CardTitle>
          </div>
          <CardDescription className="text-center">
            Enter your MT5 account credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Login ID</Label>
              <Input
                id="login"
                type="text"
                value={login}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLogin(e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 font-medium text-center">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
