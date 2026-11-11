'use client';

import React, { useMemo } from 'react';
import { AlertCircle, BarChart3, RefreshCw } from 'lucide-react';

export interface ChartDataPoint {
  period: string;
  income: number;
  expense: number;
}

export interface IncomeExpenseChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  title?: string;
  currency?: string;
  className?: string;
}

const CHART_HEIGHT = 260;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 40;
const PADDING_LEFT = 8;
const PADDING_RIGHT = 8;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

function formatAmount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(Math.round(value));
}

export function IncomeExpenseChart({
  data,
  loading = false,
  error = null,
  onRetry,
  title = 'Income vs Expense',
  currency = 'PKR',
  className = '',
}: IncomeExpenseChartProps) {
  const chart = useMemo(() => {
    if (!data || data.length === 0) {
      return { maxValue: 0, points: [] as Array<{
        period: string;
        income: number;
        expense: number;
        incomeHeight: number;
        expenseHeight: number;
        x: number;
        groupWidth: number;
      }> };
    }

    const max = Math.max(
      ...data.map((d) => Math.max(d.income, d.expense)),
      1
    );

    const totalWidth = 600;
    const plotWidth = totalWidth - PADDING_LEFT - PADDING_RIGHT;
    const groupWidth = plotWidth / data.length;

    const points = data.map((d, i) => ({
      period: d.period,
      income: d.income,
      expense: d.expense,
      incomeHeight: (d.income / max) * PLOT_HEIGHT,
      expenseHeight: (d.expense / max) * PLOT_HEIGHT,
      x: PADDING_LEFT + i * groupWidth,
      groupWidth,
    }));

    return { maxValue: max, points };
  }, [data]);

  const renderBody = () => {
    if (loading) {
      return (
        <div
          className="flex h-[260px] items-end justify-around gap-2 rounded-card bg-surface-muted p-4"
          aria-busy="true"
          aria-label="Loading chart"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-1 items-end gap-1">
              <div
                className="w-1/2 animate-pulse rounded-t bg-success/30"
                style={{ height: `${30 + (i * 8) % 60}%` }}
              />
              <div
                className="w-1/2 animate-pulse rounded-t bg-danger/30"
                style={{ height: `${20 + (i * 5) % 50}%` }}
              />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-[260px] flex-col items-center justify-center gap-3 rounded-card bg-danger/5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
            <AlertCircle className="h-6 w-6 text-danger" aria-hidden="true" />
          </div>
          <p className="text-sm font-bold text-primary">
            Could not load chart data
          </p>
          <p className="max-w-sm text-xs text-secondary">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-1 inline-flex items-center gap-1.5 rounded-control bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Retry
            </button>
          )}
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex h-[260px] flex-col items-center justify-center gap-3 rounded-card bg-surface-muted text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <BarChart3 className="h-7 w-7 text-primary" aria-hidden="true" />
          </div>
          <p className="text-sm font-bold text-primary">No chart data yet</p>
          <p className="text-xs text-secondary">
            Once transactions are recorded, income vs expense will appear here.
          </p>
        </div>
      );
    }

    return (
      <svg
        viewBox={`0 0 600 ${CHART_HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${title} chart, comparing income and expense over ${data.length} periods`}
      >
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = PADDING_TOP + PLOT_HEIGHT * (1 - frac);
          return (
            <g key={frac}>
              <line
                x1={PADDING_LEFT}
                x2={600 - PADDING_RIGHT}
                y1={y}
                y2={y}
                className="stroke-border"
                strokeWidth={1}
                strokeDasharray={frac === 0 ? undefined : '2 4'}
              />
              <text
                x={600 - PADDING_RIGHT}
                y={y - 4}
                textAnchor="end"
                className="fill-[var(--text-secondary)]"
                style={{ fontSize: 10 }}
              >
                {formatAmount(chart.maxValue * frac)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {chart.points.map((p, i) => {
          const innerPad = p.groupWidth * 0.15;
          const barGap = p.groupWidth * 0.04;
          const barWidth = (p.groupWidth - innerPad * 2 - barGap) / 2;
          const incomeX = p.x + innerPad;
          const expenseX = incomeX + barWidth + barGap;
          const incomeY = PADDING_TOP + (PLOT_HEIGHT - p.incomeHeight);
          const expenseY = PADDING_TOP + (PLOT_HEIGHT - p.expenseHeight);

          return (
            <g key={i}>
              <rect
                x={incomeX}
                y={incomeY}
                width={barWidth}
                height={Math.max(p.incomeHeight, 1)}
                rx={3}
                className="fill-success"
              />
              <rect
                x={expenseX}
                y={expenseY}
                width={barWidth}
                height={Math.max(p.expenseHeight, 1)}
                rx={3}
                className="fill-danger"
              />
              <text
                x={p.x + p.groupWidth / 2}
                y={CHART_HEIGHT - PADDING_BOTTOM + 16}
                textAnchor="middle"
                className="fill-[var(--text-secondary)]"
                style={{ fontSize: 10 }}
              >
                {p.period}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div
      className={`rounded-card border border-primary/20 bg-surface p-4 shadow-card ${className}`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-primary">{title}</h3>
        <div className="flex items-center gap-3 text-xs text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-success" aria-hidden="true" />
            Income
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-danger" aria-hidden="true" />
            Expense
          </span>
        </div>
      </div>

      {renderBody()}
    </div>
  );
}

export default IncomeExpenseChart;