"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

interface StatsChartProps {
  data: { date: string; total_cups: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border-accent/20 backdrop-blur-xl">
        <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">{dayjs(label).format("DD MMMM YYYY")}</p>
        <p className="text-sm font-mono font-bold text-accent">{payload[0].value} GELAS</p>
      </div>
    );
  }
  return null;
};

export default function StatsChart({ data }: StatsChartProps) {
  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center font-mono text-white/20 uppercase tracking-widest">Data Tidak Tersedia</div>;
  }

  return (
    <div className="h-80 w-full mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#ffffff70"
            fontSize={11}
            fontFamily="var(--font-geist-mono)"
            tickFormatter={(str) => dayjs(str).format("DD/MM")}
            dy={10}
            axisLine={false}
            tickLine={false}
          />
          <YAxis stroke="#ffffff70" fontSize={11} fontFamily="var(--font-geist-mono)" allowDecimals={false} dx={-10} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#fbbf24", strokeWidth: 1, strokeDasharray: "5 5" }} />
          <Line
            type="monotone"
            dataKey="total_cups"
            stroke="#fbbf24"
            strokeWidth={3}
            dot={{ r: 4, fill: "#000", stroke: "#fbbf24", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#fbbf24", stroke: "#fff", strokeWidth: 2 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
