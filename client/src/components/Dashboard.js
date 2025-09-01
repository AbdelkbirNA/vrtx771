import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { RingLoader } from 'react-spinners';
import { getEmailStats, getSubscribers, getEmailStatsOverTime } from '../services/api'; // Import API functions

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch summary stats and subscribers
        const emailStatsResponse = await getEmailStats();
        const subscribersResponse = await getSubscribers();
        
        setStats({
          ...emailStatsResponse.data,
          totalSubscribers: subscribersResponse.data.length,
        });

        // Fetch time-series stats for the chart
        const overTimeResponse = await getEmailStatsOverTime();
        const overTimeData = overTimeResponse.data;

        // Process data for the chart
        const labels = overTimeData.map(item => item.date);
        const dataPoints = overTimeData.map(item => item.count);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Emails Envoyés par Jour',
              data: dataPoints,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }
          ]
        });

      } catch (err) {
        setError('Erreur lors de la récupération des données du tableau de bord.');
        console.error('Erreur lors de la récupération des données du tableau de bord:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Tableau de Bord</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <div className="loading-spinner">
          <RingLoader color="#36d7b7" size={60} />
        </div>
      ) : (
        <>
          <div className="stats-container">
            <div className="stat-card">
              <h3>Total Emails envoyés</h3>
              <p>{stats?.totalEmails || 0}</p>
            </div>
            
            <div className="stat-card">
              <h3>Total Abonnés</h3>
              <p>{stats?.totalSubscribers || 0}</p>
            </div>
          </div>

          {chartData.labels ? (
            <div className="chart-container">
              <h3>Emails Envoyés au fil du temps</h3>
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          ) : (
            <p>Aucune donnée disponible pour le graphique des envois.</p>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;