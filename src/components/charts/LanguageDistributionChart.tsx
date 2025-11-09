import type { GitHubLanguageSlice } from '../../services/githubApi';

interface LanguageDistributionChartProps {
  data: GitHubLanguageSlice[];
}

const CHART_COLORS = ['#61dafb', '#9d7bff', '#f4d35e', '#34c759', '#ff6f61', '#ff9f1c', '#2ec4b6', '#a15cff'];

export function LanguageDistributionChart({ data }: LanguageDistributionChartProps) {
  if (!data.length) {
    return null;
  }

  const totalBytes = data.reduce((sum, slice) => sum + slice.bytes, 0);
  if (totalBytes === 0) {
    return null;
  }

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let accumulatedLength = 0;

  return (
    <div className="chart-card language-chart">
      <svg
        className="language-chart-svg"
        viewBox="0 0 120 120"
        role="img"
        aria-label="Language distribution pie chart"
      >
        <circle className="language-chart-background" cx="60" cy="60" r={radius} strokeWidth={18} />
        {data.map((slice, index) => {
          const length = circumference * (slice.bytes / totalBytes);
          const dashArray = `${length} ${circumference - length}`;
          const circle = (
            <circle
              key={slice.language}
              className="language-chart-segment"
              cx="60"
              cy="60"
              r={radius}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={18}
              strokeDasharray={dashArray}
              strokeDashoffset={-accumulatedLength}
              transform="rotate(-90 60 60)"
            />
          );
          accumulatedLength += length;
          return circle;
        })}
      </svg>

      <ul className="language-chart-legend">
        {data.map((slice, index) => {
          const ratio = (slice.bytes / totalBytes) * 100;
          return (
            <li key={slice.language} className="language-chart-legend-item">
              <span
                className="language-chart-legend-swatch"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="language-chart-legend-label">{slice.language}</span>
              <span className="language-chart-legend-value">{ratio.toFixed(1)}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
