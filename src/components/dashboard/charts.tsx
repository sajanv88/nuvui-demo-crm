"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTable,
  ChartTooltip,
  chartColor,
  chartFill,
} from "@nuvui/charts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nuvui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Label,
  LabelList,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { type Provider, providerLabels } from "web/lib/labels";
import type { MonthRow, ProviderRow } from "web/lib/types";

/* Growth: new contacts each month, with the running total. */

const growthConfig = {
  signups: { label: "New contacts" },
  total: { label: "Running total", dash: "solid" },
} satisfies ChartConfig;

export function GrowthChart({ months }: { months: MonthRow[] }) {
  const first = months[0]?.label ?? "";
  const last = months[months.length - 1]?.label ?? "";

  return (
    <ChartContainer
      config={growthConfig}
      aria-label={`New contacts each month and the running total, ${first} to ${last}`}
      className="dashboard__chart dashboard__chart--wide"
      table={
        <ChartTable data={months} category="label" categoryLabel="Month" />
      }
    >
      <ComposedChart data={months} margin={{ top: 8, right: 4, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={12}
        />
        <YAxis
          yAxisId="signups"
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={28}
        />
        <YAxis
          yAxisId="total"
          orientation="right"
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={32}
        />
        <ChartTooltip />
        <ChartLegend />
        <Bar
          yAxisId="signups"
          dataKey="signups"
          fill={chartFill("signups")}
          radius={[4, 4, 0, 0]}
          maxBarSize={36}
        />
        <Line
          yAxisId="total"
          dataKey="total"
          type="monotone"
          stroke={chartColor("total")}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </ComposedChart>
    </ChartContainer>
  );
}

/* Email providers, as a donut with the total in the middle. */

const providerConfig = {
  gmail: { label: providerLabels.gmail },
  yahoo: { label: providerLabels.yahoo },
  hotmail: { label: providerLabels.hotmail },
  other: { label: providerLabels.other },
} satisfies ChartConfig;

const providerName = (key: number | string) =>
  providerLabels[key as Provider] ?? String(key);

export function ProviderChart({ providers }: { providers: ProviderRow[] }) {
  const total = providers.reduce((sum, row) => sum + row.contacts, 0);
  const slices = providers.map((row) => ({
    ...row,
    fill: chartFill(row.provider),
  }));
  const summary = providers
    .map((row) => `${providerName(row.provider)} ${row.contacts}`)
    .join(", ");

  return (
    <ChartContainer
      config={providerConfig}
      aria-label={`Contacts by email provider, ${total} in all: ${summary}`}
      className="dashboard__chart dashboard__chart--round"
      patterns
      table={
        <ChartTable
          data={providers}
          category="provider"
          categoryLabel="Provider"
          series={["contacts"]}
          formatCategory={providerName}
        />
      }
    >
      <PieChart>
        <ChartTooltip hideLabel nameKey="provider" />
        <ChartLegend nameKey="provider" />
        <Pie
          data={slices}
          dataKey="contacts"
          nameKey="provider"
          innerRadius="62%"
          outerRadius="90%"
          strokeWidth={3}
          paddingAngle={2}
        >
          <Label
            value={total}
            position="center"
            dy={-10}
            className="dashboard__donut-value"
          />
          <Label
            value="contacts"
            position="center"
            dy={14}
            className="dashboard__donut-caption"
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

/* When people sign up: by weekday, and by time of day. */

const activityConfig = {
  contacts: { label: "Sign-ups" },
} satisfies ChartConfig;

function ActivityBars({
  data,
  category,
  categoryLabel,
  label,
}: {
  data: Record<string, string | number>[];
  category: string;
  categoryLabel: string;
  label: string;
}) {
  return (
    <ChartContainer
      config={activityConfig}
      aria-label={label}
      className="dashboard__chart"
      table={
        <ChartTable
          data={data}
          category={category}
          categoryLabel={categoryLabel}
        />
      }
    >
      <BarChart data={data} margin={{ top: 20, right: 0, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey={category} tickLine={false} axisLine={false} />
        <YAxis hide allowDecimals={false} />
        <ChartTooltip />
        <Bar
          dataKey="contacts"
          fill={chartFill("contacts")}
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        >
          <LabelList dataKey="contacts" position="top" offset={6} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function ActivityChart({
  weekdays,
  dayparts,
}: {
  weekdays: { day: string; contacts: number }[];
  dayparts: { part: string; contacts: number }[];
}) {
  return (
    <Tabs defaultValue="weekday" className="dashboard__tabs">
      <TabsList aria-label="Group sign-ups by">
        <TabsTrigger value="weekday">Weekday</TabsTrigger>
        <TabsTrigger value="daypart">Time of day</TabsTrigger>
      </TabsList>
      <TabsContent value="weekday">
        <ActivityBars
          data={weekdays}
          category="day"
          categoryLabel="Weekday"
          label="Sign-ups by day of the week, Monday to Sunday"
        />
      </TabsContent>
      <TabsContent value="daypart">
        <ActivityBars
          data={dayparts}
          category="part"
          categoryLabel="Time of day (UTC)"
          label="Sign-ups by time of day in UTC: night, morning, afternoon and evening"
        />
      </TabsContent>
    </Tabs>
  );
}

/* Website domains, as horizontal bars with the count at the end. */

const domainConfig = {
  contacts: { label: "Websites" },
} satisfies ChartConfig;

export function DomainChart({
  domains,
}: {
  domains: { domain: string; contacts: number }[];
}) {
  return (
    <ChartContainer
      config={domainConfig}
      aria-label={`Contact websites by top-level domain: ${domains
        .map((row) => `${row.domain} ${row.contacts}`)
        .join(", ")}`}
      className="dashboard__chart"
      table={
        <ChartTable data={domains} category="domain" categoryLabel="Domain" />
      }
    >
      <BarChart
        data={domains}
        layout="vertical"
        margin={{ top: 0, right: 32, left: 0, bottom: 0 }}
        barCategoryGap={6}
      >
        <XAxis type="number" dataKey="contacts" hide />
        <YAxis
          type="category"
          dataKey="domain"
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <ChartTooltip hideLabel={false} cursor={false} />
        <Bar dataKey="contacts" fill={chartFill("contacts")} radius={4}>
          <LabelList dataKey="contacts" position="right" offset={8} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
