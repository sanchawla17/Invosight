import { useState } from "react";

const DonutChart = ({ data, colors }) => {
  const [activeSegment, setActiveSegment] = useState(null);
  const total = data.reduce((acc, item) => acc + item.count, 0);
  const size = 160;
  const center = size / 2;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-500">
        No status data yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onMouseLeave={() => setActiveSegment(null)}
        className="shrink-0"
      >
        <g transform={`rotate(-90 ${center} ${center})`}>
          {data.map((segment) => {
            const value = segment.count / total;
            const strokeDasharray = `${value * circumference} ${
              circumference - value * circumference
            }`;
            const circle = (
              <circle
                key={segment.status}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={colors[segment.status] || "#94a3b8"}
                strokeWidth={activeSegment?.status === segment.status ? "20" : "16"}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                onMouseEnter={() => setActiveSegment(segment)}
              />
            );
            offset += value * circumference;
            return circle;
          })}
        </g>
        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-slate-900 text-sm font-semibold"
        >
          {total}
        </text>
        <text
          x={center}
          y={center + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-slate-500 text-xs"
        >
          invoices
        </text>
      </svg>
      <div className="space-y-3 text-sm text-slate-600 w-full max-w-xs">
        {data.map((segment) => (
          <div key={segment.status} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colors[segment.status] || "#94a3b8" }}
            />
            <span
              className={`flex-1 ${
                activeSegment?.status === segment.status
                  ? "text-slate-900 font-semibold"
                  : ""
              }`}
            >
              {segment.status}
            </span>
            <span className="text-slate-900 font-medium">{segment.count}</span>
          </div>
        ))}
        <div className="text-xs text-slate-500 pt-2">
          {activeSegment
            ? `${activeSegment.status}: ${activeSegment.count} (${Math.round(
                (activeSegment.count / total) * 100
              )}%)`
            : "Hover a segment to see the share."}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
