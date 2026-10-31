
"use client";

import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ClassificationChartProps {
  spam: number;
  ham: number;
}

export function ClassificationChart({
  spam,
  ham,
}: ClassificationChartProps) {
  const data = [
    { name: "Spam", value: spam },
    { name: "Ham", value: ham },
  ];

  const total = spam + ham;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Classification Distribution</CardTitle>
      </CardHeader>

      <CardContent>
        {total === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No classification data available.
          </div>
        ) : (
          <>
            <div className="relative h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    <Cell fill="#737373" />
                    <Cell fill="#D4D4D4" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{total}</span>
                <span className="text-xs text-muted-foreground">
                  Total
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-sm bg-neutral-500" />
                Spam: {spam}
              </div>

              <div className="flex items-center gap-2">
                <span className="size-3 rounded-sm bg-neutral-300" />
                Ham: {ham}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
