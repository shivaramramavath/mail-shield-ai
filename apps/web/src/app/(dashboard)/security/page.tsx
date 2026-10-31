
"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, Shield } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-3xl space-y-7">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Configure your MailShield workspace.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize your application theme.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            onClick={() => setTheme("light")}
          >
            <Sun className="mr-2 size-4" />
            Light
          </Button>

          <Button
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => setTheme("dark")}
          >
            <Moon className="mr-2 size-4" />
            Dark
          </Button>

          <Button
            variant={theme === "system" ? "default" : "outline"}
            onClick={() => setTheme("system")}
          >
            <Monitor className="mr-2 size-4" />
            System
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>
            Information about anonymous email processing.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">Anonymous workspace</p>
              <p className="text-sm text-muted-foreground">
                No registration or login required.
              </p>
            </div>
            <Badge variant="outline">Enabled</Badge>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Shield className="size-5" />
            <p className="text-sm text-muted-foreground">
              Email content should not be retained unnecessarily.
              AI providers may process submitted content, so avoid
              sending sensitive information.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application</CardTitle>
          <CardDescription>MailShield AI</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Email Intelligence Platform · Version 1.0.0
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
