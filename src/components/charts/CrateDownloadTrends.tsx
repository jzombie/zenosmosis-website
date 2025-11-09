import type { CrateDownloadSeries } from '../../services/cratesApi';

interface CrateDownloadTrendsProps {
  data: CrateDownloadSeries[];
  days?: number;
}

const SPARKLINE_WIDTH = 200;
const SPARKLINE_HEIGHT = 60;

function buildSparklinePoints(series: CrateDownloadSeries) {
  const points: string[] = [];
  const values = series.daily.map((entry) => entry.downloads);

  if (!values.length) {
    return '';
  }

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;

  values.forEach((value, index) => {
    const x = values.length === 1 ? 0 : (index / (values.length - 1)) * SPARKLINE_WIDTH;
    const normalized = (value - minValue) / range;
    const y = SPARKLINE_HEIGHT - normalized * SPARKLINE_HEIGHT;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  });

  return points.join(' ');
}

export function CrateDownloadTrends({ data, days = 30 }: CrateDownloadTrendsProps) {
  if (!data.length) {
    return null;
  }

  return (
    <div className="chart-card crate-chart">
      <div className="crate-chart-grid">
        {data.map((series) => {
          const points = buildSparklinePoints(series);
          const maxValue = series.daily.reduce((max, entry) => Math.max(max, entry.downloads), 0);
          const latest = series.daily.at(-1)?.downloads ?? 0;

          return (
            <a
              key={series.crate}
              className="crate-card"
              href={series.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="crate-card-header">
                <div>
                  <h5 className="crate-card-title">{series.crate}</h5>
                  <p className="crate-card-subtitle">{series.recentDownloads.toLocaleString()} downloads · last {days} days</p>
                </div>
                <span className="crate-card-latest">{latest.toLocaleString()} today</span>
              </div>
              <svg
                className="crate-card-sparkline"
                viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
                preserveAspectRatio="none"
                role="img"
                aria-label={`Download history for ${series.crate}`}
              >
                <polyline className="crate-card-sparkline-area" points={`0,${SPARKLINE_HEIGHT} ${points} ${SPARKLINE_WIDTH},${SPARKLINE_HEIGHT}`} />
                <polyline className="crate-card-sparkline-line" points={points} />
              </svg>
              <div className="crate-card-footer">
                <span className="crate-card-footer-label">Peak day</span>
                <span className="crate-card-footer-value">{maxValue.toLocaleString()} downloads</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
