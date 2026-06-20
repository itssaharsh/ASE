import React, { useState, useEffect } from 'react';
import '../styles/index.css';

const TopBar = ({ riskData }) => {
  const [time, setTime] = useState(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalActive = riskData.length;
  const impactedRegions = new Set(riskData.map(r => r.region)).size;
  
  const avgRisk = riskData.length ? (riskData.reduce((acc, curr) => acc + curr.total_crisis_index, 0) / riskData.length) : 0;
  const globalLevel = avgRisk > 70 ? 'CRITICAL' : avgRisk > 50 ? 'HIGH' : avgRisk > 30 ? 'ELEVATED' : 'MODERATE';
  const levelColor = avgRisk > 70 ? '#ff0055' : avgRisk > 50 ? '#ff4d4d' : avgRisk > 30 ? '#ffa64d' : '#4da6ff';

  return (
    <div className="topbar glass-panel">
      <div className="topbar-left">
        <h1>GLOBAL CRISIS MONITORING</h1>
        <div className="topbar-status">
          <div className="live-indicator">
            <span className="pulse-dot"></span> LIVE
          </div>
          <div className="clock">{time}</div>
        </div>
      </div>
      
      <div className="topbar-center">
        <div className="global-risk">
          <span className="label">🌍 Global Risk Level:</span>
          <span className="value" style={{ color: levelColor, textShadow: `0 0 10px ${levelColor}88` }}>
            {globalLevel}
          </span>
        </div>
        <div className="stats-row">
          <div className="stat">Alerts: <strong>{totalActive}</strong></div>
          <div className="stat">Regions: <strong>{impactedRegions}</strong></div>
          <div className="stat">System: <strong style={{color: '#4ade80'}}>Operational</strong></div>
        </div>
      </div>

      <div className="topbar-right">
        <select className="filter-dropdown"><option>All Threats ▼</option></select>
        <select className="filter-dropdown"><option>Severity ▼</option></select>
        <select className="filter-dropdown"><option>Region ▼</option></select>
        <select className="filter-dropdown"><option>Last 24h ▼</option></select>
      </div>
    </div>
  );
};

export default TopBar;
