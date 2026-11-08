"use client";

import {
  ChartContainer,
  ChartTable,
  ChartTooltip,
  chartColor,
  chartFill,
} from "@nuvui/charts";
import {
  Stat,
  StatChart,
  StatDescription,
  StatLabel,
  StatValue,
  Trend,
} from "@nuvui/react";
import { Area, AreaChart, XAxis } from "recharts";
import type { Figure } from "web/lib/types";

export function Figures({ figures }: { figures: Figure[] }) {
  return (
    <ul className="dashboard__figures">
      {figures.map((figure) => (
        <li key={figure.label}>
          <Stat className="dashboard__figure">
            <StatLabel>{figure.label}</StatLabel>
            <StatValue>{figure.value}</StatValue>
            <StatDescription>
              {figure.change === undefined ? null : (
                <>
                  <Trend value={figure.change} />{" "}
                </>
              )}
              {figure.description}
            </StatDescription>
            <StatChart>
              <ChartContainer
                config={{ value: { label: figure.label } }}
                aria-label={`${figure.label}, month by month over the last year`}
                className="dashboard__spark"
                table={
                  <ChartTable
                    data={figure.spark}
                    category="label"
                    categoryLabel="Month"
                  />
                }
              >
                <AreaChart
                  data={figure.spark}
                  margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
                >
                  <XAxis dataKey="label" hide />
                  <ChartTooltip indicator="line" />
                  <Area
                    dataKey="value"
                    type="monotone"
                    fill={chartFill("value")}
                    fillOpacity={0.2}
                    stroke={chartColor("value")}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </StatChart>
          </Stat>
        </li>
      ))}
    </ul>
  );
}
