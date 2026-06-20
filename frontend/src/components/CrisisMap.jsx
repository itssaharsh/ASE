import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const getRiskColor = (score) => {
  if (score >= 80) return '#ef4444'; // Red
  if (score >= 50) return '#f97316'; // Orange
  if (score >= 20) return '#eab308'; // Yellow
  return '#06b6d4'; // Cyan
};

const CrisisMap = ({ riskData }) => {
  const getCoordinates = (domain, index, regionOverride = null) => {
    const coords = {
      "Southeast Asia": [15, 105],
      "Eastern Europe": [50, 30],
      "Middle East": [25, 45],
      "North America": [40, -100],
      "Sub-Saharan Africa": [0, 20],
      "East Asia": [35, 135],
      "South America": [-15, -60],
      "Western Europe": [48, 2],
      economy: [40.7128, -74.0060],
      pandemic: [39.9042, 116.4074],
      conflict: [48.3794, 31.1656],
      social_unrest: [48.8566, 2.3522]
    };
    
    const key = regionOverride || domain;
    const base = coords[key] || [51.5074, -0.1278]; // London Default
    
    const jitterFactor = 8;
    const jitterLat = (Math.sin(index * 123.456) * jitterFactor);
    const jitterLng = (Math.cos(index * 123.456) * jitterFactor);
    
    return [base[0] + jitterLat, base[1] + jitterLng];
  };

  return (
    <div className="map-container glass-panel map-glass">
      <MapContainer center={[20, 0]} zoom={2} style={{ height: '700px', width: '100%', borderRadius: '16px', background: 'transparent' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        {riskData.map((item, index) => {
          const originPos = getCoordinates(item.domain, index, item.region);
          const color = getRiskColor(item.total_crisis_index);
          const radius = Math.max(item.total_crisis_index / 3, 8);
          
          return (
            <React.Fragment key={item.article_id + index}>
              {Object.keys(item.predicted_spread).map((targetRegion, i) => {
                 const targetPos = getCoordinates(item.domain, index + i + 1, targetRegion);
                 return (
                   <Polyline 
                     key={`line-${index}-${i}`} 
                     positions={[originPos, targetPos]} 
                     pathOptions={{ color: color, weight: 2, dashArray: '5, 10', opacity: 0.5 }} 
                   />
                 );
              })}

              <CircleMarker
                center={originPos}
                pathOptions={{ fillColor: color, color: color, fillOpacity: 0.8, weight: 2 }}
                radius={radius}
              >
                <Popup className="custom-popup">
                  <div className="popup-header">
                    <span className="popup-domain" style={{color}}>{item.domain.toUpperCase()}</span>
                    <span className="popup-time">{item.timestamp.substring(11, 16)} UTC</span>
                  </div>
                  <strong className="popup-title">{item.title}</strong>
                  <div className="popup-metrics">
                    <div className="popup-metric">
                      <span>Risk Index</span>
                      <strong style={{ color }}>{item.total_crisis_index}/100</strong>
                    </div>
                    <div className="popup-metric">
                      <span>Confidence</span>
                      <strong>{item.confidence_score}%</strong>
                    </div>
                    <div className="popup-metric">
                      <span>Sources</span>
                      <strong>{item.source_count}</strong>
                    </div>
                  </div>
                  {Object.keys(item.predicted_spread).length > 0 && (
                    <div className="popup-predictions">
                      <strong>AI Forecast Spread:</strong>
                      <ul>
                        {Object.entries(item.predicted_spread).map(([reg, prob]) => (
                          <li key={reg}>{reg} <span className="prob" style={{color: prob > 70 ? '#ef4444' : '#f97316'}}>{prob}%</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default CrisisMap;
