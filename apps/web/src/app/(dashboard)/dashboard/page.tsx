
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Activity,
  Clock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Overview = {
  total: number;
  spam: number;
  ham: number;
  avgDurationMs: number;
};

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery<Overview>({
    queryKey: ["analytics-overview"],
    queryFn: async () => {
      const response = await axios.get(
        `${API}/api/v1/analytics/overview`
      );
      return response.data;
    },
    refetchInterval: 30000,
  });

  const stats = [
    {
      title: "Total analyzed",
      value: data?.total ?? 0,
      icon: Mail,
    },
    {
      title: "Spam detected",
      value: data?.spam ?? 0,
      icon: ShieldAlert,
    },
    {
      title: "Legitimate emails",
      value: data?.ham ?? 0,
      icon: ShieldCheck,
    },
    {
      title: "Average processing",
      value: `${data?.avgDurationMs ?? 0} ms`,
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Overview
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Monitor your email analysis activity.
          </p>
        </div>

        <Button asChild>
          <Link href="/analyze">
            Analyze email <ArrowUpRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>

      {isError && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="text-sm text-muted-foreground">
              Unable to retrieve analytics. Check your NestJS server.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Classification distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Spam</span>
                <span>{data?.spam ?? 0}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-foreground"
                  style={{
                    width: `${
                      data?.total
                        ? (data.spam / data.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Ham</span>
                <span>{data?.ham ?? 0}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full border border-foreground bg-background"
                  style={{
                    width: `${
                      data?.total
                        ? (data.ham / data.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/analyze">
                <ShieldCheck className="mr-2 size-4" />
                Analyze an email
              </Link>
            </Button>

            <Button asChild variant="outline" className="justify-start">
              <Link href="/generate">
                <Mail className="mr-2 size-4" />
                Generate an email
              </Link>
            </Button>

            <Button asChild variant="outline" className="justify-start">
              <Link href="/batch">
                <Activity className="mr-2 size-4" />
                Batch classification
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Statistics represent aggregate analysis records, not individual
        user activity. Raw email content is not retained by the analysis
        endpoint.
      </p>
    </div>
  );
}
