import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

const MetricsPanel = ({ riskData }) => {
  const predictions = [];
  const regionRiskMap = {};
  
  riskData.forEach(item => {
    if (!regionRiskMap[item.region]) regionRiskMap[item.region] = 0;
    regionRiskMap[item.region] += item.total_crisis_index;

    Object.entries(item.predicted_spread).forEach(([region, prob]) => {
      predictions.push({ region, prob, source: item.domain });
    });
  });

  const topRegions = Object.entries(regionRiskMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const topPredictions = predictions
    .sort((a, b) => b.prob - a.prob)
    .slice(0, 3);

  const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false, min: 0, max: 100 }
    },
    elements: { point: { radius: 0 } },
    animation: { duration: 0 }
  };

  const createSparklineData = (color) => ({
    labels: ['1','2','3','4','5','6','7'],
    datasets: [{
      data: Array.from({length: 7}, () => Math.floor(Math.random() * 50) + 20),
      borderColor: color,
      borderWidth: 2,
      tension: 0.4
    }]
  });

  return (
    <div className="metrics-panel">
      <div className="glass-panel metric-card">
        <h3>Top Risk Regions</h3>
        <ul className="ranked-list">
          {topRegions.map(([region, score], idx) => (
            <li key={idx}>
              <span className="rank">{idx + 1}.</span>
              <span className="region-name">{region}</span>
              <span className="region-score" style={{color: score > 200 ? '#ff4d4d' : '#ffa64d'}}>{Math.round(score)}</span>
            </li>
          ))}
          {topRegions.length === 0 && <li className="empty-state">No active regions</li>}
        </ul>
      </div>

      <div className="glass-panel metric-card">
        <h3>AI Forecast <span className="horizon-badge">72h</span></h3>
        <div className="forecast-list">
          {topPredictions.map((pred, idx) => (
            <div className="forecast-item" key={idx}>
              <div className="forecast-header">
                <span>{pred.region}</span>
                <strong style={{color: pred.prob > 70 ? '#ff4d4d' : '#ffa64d'}}>{Math.round(pred.prob)}%</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${pred.prob}%`, background: pred.prob > 70 ? '#ff4d4d' : '#ffa64d'}}></div>
              </div>
            </div>
          ))}
          {topPredictions.length === 0 && <div className="empty-state">No high-probability spread</div>}
        </div>
      </div>

      <div className="glass-panel metric-card">
        <h3>Threat Trends</h3>
        <div className="trend-item">
          <span>Pandemic</span>
          <div className="sparkline-wrapper"><Line options={sparklineOptions} data={createSparklineData('#4da6ff')} /></div>
        </div>
        <div className="trend-item">
          <span>Economy</span>
          <div className="sparkline-wrapper"><Line options={sparklineOptions} data={createSparklineData('#ffa64d')} /></div>
        </div>
        <div className="trend-item">
          <span>Conflict</span>
          <div className="sparkline-wrapper"><Line options={sparklineOptions} data={createSparklineData('#ff4d4d')} /></div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;
