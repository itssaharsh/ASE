import React, { useState, useEffect } from 'react';
import TopBar from './TopBar';
import CrisisMap from './CrisisMap';
import NewsFeed from './NewsFeed';
import MetricsPanel from './MetricsPanel';
import '../styles/index.css';

const Dashboard = () => {
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      import('axios').then((axios) => {
        axios.default.get('http://localhost:8000/api/v1/risk/live')
          .then(res => {
            setRiskData(res.data);
            setLoading(false);
          })
          .catch(err => {
            console.error("Failed to fetch live data:", err);
            setLoading(false);
          });
      });
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 30000); // Fetch every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <TopBar riskData={riskData} />

      {loading ? (
        <div className="loading">Initializing Command Center...</div>
      ) : (
        <div className="dashboard-grid">
          <div className="map-section">
            <CrisisMap riskData={riskData} />
          </div>
          <div className="feed-section">
            <NewsFeed riskData={riskData} />
          </div>
          <div className="metrics-section">
            <MetricsPanel riskData={riskData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
