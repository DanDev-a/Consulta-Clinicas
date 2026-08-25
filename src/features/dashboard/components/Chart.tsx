import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  AreaChart,
  PieChart,
  Line,
  Bar,
  Area,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useEffect, useState } from 'react';

type ChartType = 'line' | 'bar' | 'area' | 'pie';

interface ChartDataItem {
  [key: string]: string | number;
}

interface ChartProps {
  type: ChartType;
  data: ChartDataItem[];
  dataKey: string;
  xAxisKey?: string;
  title?: string;
  height?: number;
  color?: string;
}

function useThemeColor(varName: string): string {
  const [color, setColor] = useState('#89b4fa');

  useEffect(() => {
    const get = () => {
      const root = document.documentElement;
      return getComputedStyle(root).getPropertyValue(varName).trim() || '#89b4fa';
    };
    setColor(get());

    const observer = new MutationObserver(() => setColor(get()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, [varName]);

  return color;
}

export default function Chart({
  type,
  data,
  dataKey,
  xAxisKey = 'name',
  title,
  height = 300,
  color,
}: ChartProps) {
  const accentColor = useThemeColor('--color-accent');
  const textColor = useThemeColor('--color-text-muted');
  const borderColor = useThemeColor('--color-border');

  const stroke = color || accentColor;

  const commonAxisProps = {
    tick: { fill: textColor, fontSize: 12 },
    axisLine: { stroke: borderColor },
    tickLine: false as const,
  };

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      fontSize: '13px',
    },
    itemStyle: { color: textColor },
  };

  const legendStyle = {
    wrapperStyle: { fontSize: '13px', color: textColor },
  };

  if (type === 'pie') {
    return (
      <article className="w-full">
        {title && (
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">
            {title}
          </h3>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={Math.min(height, 300) / 2.5}
              fill={accentColor}
              stroke="var(--color-surface)"
              strokeWidth={2}
            />
            <Tooltip {...tooltipStyle} />
            <Legend {...legendStyle} />
          </PieChart>
        </ResponsiveContainer>
      </article>
    );
  }

  return (
    <article className="w-full">
      {title && (
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            <Tooltip {...tooltipStyle} />
            <Legend {...legendStyle} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={stroke}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: stroke }}
            />
          </LineChart>
        ) : type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            <Tooltip {...tooltipStyle} />
            <Legend {...legendStyle} />
            <Bar dataKey={dataKey} fill={accentColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={stroke} stopOpacity={0.3} />
                <stop offset="95%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            <Tooltip {...tooltipStyle} />
            <Legend {...legendStyle} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={stroke}
              strokeWidth={2}
              fill="url(#areaGradient)"
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </article>
  );
}
