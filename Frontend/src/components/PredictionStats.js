import React, { useState, useEffect } from 'react';
import { getPredictionStats } from '../api';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

const PredictionStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPredictionStats();
        console.log('Received stats:', data);
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load prediction statistics');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading statistics...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const renderTrend = (trend) => {
    const Icon = trend >= 0 ? ArrowUpIcon : ArrowDownIcon;
    const color = trend >= 0 ? 'text-green-500' : 'text-red-500';
    return (
      <div className={`flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4 mr-1" />
        <span>{Math.abs(trend).toFixed(2)}%</span>
      </div>
    );
  };

  return (
    <div className="flex justify-around mb-4 p-4 bg-gray-100 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Fans Predictions</h3>
        <p className="text-3xl font-bold text-blue-600">
          {stats.today.userAccuracy.toFixed(2)}%
        </p>
        {renderTrend(stats.userTrend)}
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold">AI Predictions</h3>
        <p className="text-3xl font-bold text-green-600">
          {stats.today.adminAccuracy.toFixed(2)}%
        </p>
        {renderTrend(stats.adminTrend)}
      </div>
    </div>
  );
};

export default PredictionStats;