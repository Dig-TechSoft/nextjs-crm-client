"use client";

import { useEffect, useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/Header";
import { User, Mail, Phone, Calendar, Hash, UserCheck } from "lucide-react";

interface UserProfile {
  Login: number;
  Registration: string;
  Phone: string;
  Email: string;
  Name: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const t = useTranslations("Profile");
  const format = useFormatter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();

      if (data.success) {
        setProfile(data.user);
      } else {
        setError(data.error || t("loadError"));
      }
    } catch (err) {
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format.dateTime(new Date(dateString), {
      dateStyle: "long",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto py-12">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-center text-red-500">{error || t("loadError")}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const initials = profile.Name.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 md:p-12 border">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <Avatar className="h-32 w-32 border-4 border-background shadow-2xl">
                <AvatarImage src="" />
                <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="text-center md:text-left space-y-4 flex-1">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">{profile.Name}</h1>
                  <p className="text-xl text-muted-foreground mt-2">{t("traderAccount")}</p>
                </div>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Badge variant="secondary" className="text-sm px-4 py-1">
                    <Hash className="h-3.5 w-3.5 mr-1" />
                    {t("login")}: {profile.Login}
                  </Badge>
                  <Badge variant="outline">
                    <UserCheck className="h-3.5 w-3.5 mr-1" />
                    {t("active")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t("accountDetails")}
                </CardTitle>
                <CardDescription>{t("registrationInfo")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("fullName")}</span>
                  <span className="font-medium">{profile.Name}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("accountId")}</span>
                  <span className="font-mono font-semibold text-primary">{profile.Login}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("registrationDate")}</span>
                  <span className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(profile.Registration)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  {t("contactInfo")}
                </CardTitle>
                <CardDescription>{t("reachYou")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("email")}</span>
                  <a href={`mailto:${profile.Email}`} className="font-medium text-primary hover:underline">
                    {profile.Email}
                  </a>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("phone")}</span>
                  <a href={`tel:${profile.Phone}`} className="font-medium text-primary hover:underline flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {profile.Phone || t("notProvided")}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fun Footer Note */}
          <Card className="border-dashed bg-muted/20">
            <CardContent className="py-8 text-center">
              <p className="text-lg font-medium text-foreground">
                {t("welcomeBack", { name: profile.Name.split(" ")[0] })}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t("allSet")}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
