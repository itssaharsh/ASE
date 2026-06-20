import React from 'react';

const NewsFeed = ({ riskData }) => {
  return (
    <div className="news-feed">
      {riskData.length === 0 && (
        <div className="empty-state glass-panel">
          <div className="empty-icon">✓</div>
          <h4>No Active Threats</h4>
          <p>System operational. All regions stable.</p>
        </div>
      )}
      {riskData.map((item, index) => {
        const severityClass = item.total_crisis_index >= 80 ? 'critical' : item.total_crisis_index >= 50 ? 'high' : item.total_crisis_index >= 20 ? 'elevated' : 'moderate';
        return (
          <div className={`news-card glass-panel border-${severityClass}`} key={index}>
            <div className="news-card-header">
              <span className={`badge bg-${severityClass}`}>
                <span className="pulse-dot-small"></span>
                {item.domain.toUpperCase()}
              </span>
              <span className="timestamp">{item.timestamp.substring(11, 16)} UTC</span>
            </div>
            
            <div className="news-card-metrics">
              <div className="metric">
                <span className="label">Risk</span>
                <span className={`value text-${severityClass}`}>{item.total_crisis_index}</span>
              </div>
              <div className="metric">
                <span className="label">Confidence</span>
                <span className="value">{item.confidence_score}%</span>
              </div>
              <div className="metric">
                <span className="label">Sources</span>
                <span className="value">{item.source_count}</span>
              </div>
            </div>

            <h3 className="news-title">{item.title}</h3>
            {item.description && <p className="news-description">{item.description.substring(0, 100)}...</p>}
            
            <div className="news-card-footer">
              <div className="region-tag">📍 {item.region}</div>
              {Object.keys(item.predicted_spread).length > 0 && (
                <div className="spread-tag">
                  ↳ Spread: {Object.keys(item.predicted_spread).slice(0, 2).join(', ')}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NewsFeed;
