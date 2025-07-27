"use client";

import { moveAnalyticsData } from "@/store/atoms/analysis";
import { useRecoilValue } from "recoil";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

export function ChartAreaGame() {
  const analyticsData = useRecoilValue(moveAnalyticsData);

  const chartData =
  analyticsData?.data?.moves
    ?.reduce((acc: any[], move: any, index: number) => {
      if (index % 2 === 0) {
        // White move
        acc.push({
          move: `#${Math.floor(index / 2) + 1}`,
          white: move.accuracy ?? null,
          black: null,
        });
      } else {
        // Black move
        acc[acc.length - 1].black = move.accuracy ?? null;
      }
      return acc;
    }, []) || [];

  return (
    <Card className="h-48 w-full">

      <CardContent className="h-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorWhite" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBlack" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="move" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="white"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorWhite)"
              name="White Accuracy"
            />
            <Area
              type="monotone"
              dataKey="black"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#colorBlack)"
              name="Black Accuracy"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
