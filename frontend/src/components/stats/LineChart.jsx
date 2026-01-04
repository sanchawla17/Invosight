import { useState } from "react";
import { formatMoney } from "../../utils/format";
import { formatPeriodLabel } from "../../utils/date";

const LineChart = ({ data, interval, valueKey }) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-500">
        No data available for this range.
      </div>
    );
  }

  const width = 640;
  const height = 220;
  const padding = 32;
  const [hoverIndex, setHoverIndex] = useState(null);

  const values = data.map((item) => Number(item[valueKey] || 0));
  const maxValue = Math.max(...values, 1);
  const xStep =
    data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const yScale = (height - padding * 2) / maxValue;

  const points = values.map((value, index) => ({
    x: padding + index * xStep,
    y: height - padding - value * yScale,
  }));

  const linePath = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const areaPath = [
    `M ${points[0].x} ${height - padding}`,
    ...points.map((point) => `L ${point.x} ${point.y}`),
    `L ${points[points.length - 1].x} ${height - padding}`,
    "Z",
  ].join(" ");

  const labelIndexes = Array.from(
    new Set([0, Math.floor((data.length - 1) / 2), data.length - 1])
  );

  const handlePointerMove = (clientX, target) => {
    const rect = target.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * width;
    const index =
      data.length === 1
        ? 0
        : Math.round((x - padding) / Math.max(xStep, 1));
    const clamped = Math.min(Math.max(index, 0), data.length - 1);
    setHoverIndex(clamped);
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
  };

  const activePoint = hoverIndex !== null ? points[hoverIndex] : null;
  const activeValue = hoverIndex !== null ? values[hoverIndex] : null;
  const activeLabel =
    hoverIndex !== null
      ? formatPeriodLabel(data[hoverIndex].periodStart, interval)
      : "";
  const activeLeft =
    activePoint !== null ? (activePoint.x / width) * 100 : 0;

  return (
    <div className="w-full relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-56 text-emerald-600"
        aria-hidden="true"
        onMouseMove={(event) =>
          handlePointerMove(event.clientX, event.currentTarget)
        }
        onMouseLeave={handlePointerLeave}
        onTouchMove={(event) => {
          if (event.touches.length > 0) {
            handlePointerMove(event.touches[0].clientX, event.currentTarget);
          }
        }}
        onTouchEnd={handlePointerLeave}
      >
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#047857" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#revenueFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={hoverIndex === index ? 6 : 4}
            fill="currentColor"
            className={hoverIndex === index ? "opacity-100" : "opacity-60"}
          />
        ))}
      </svg>
      {activePoint !== null && (
        <div
          className="absolute top-4 bg-white border border-slate-200 shadow-sm rounded-md px-3 py-2 text-xs text-slate-600"
          style={{ left: `${activeLeft}%`, transform: "translateX(-50%)" }}
        >
          <div className="text-slate-900 font-semibold">
            {formatMoney(activeValue)}
          </div>
          <div>{activeLabel}</div>
        </div>
      )}
      <div className="flex justify-between text-xs text-slate-500 mt-2">
        {labelIndexes.map((index) => (
          <span key={index}>
            {formatPeriodLabel(data[index].periodStart, interval)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LineChart;
