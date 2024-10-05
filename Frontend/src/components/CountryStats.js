import React, { useState, useEffect } from 'react';
import { getCountryStats } from './api';

const CountryStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getCountryStats();
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load country statistics');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading country statistics...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Prediction Accuracy by Country</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Country</th>
            <th className="text-right">Total Votes</th>
            <th className="text-right">Correct Predictions</th>
            <th className="text-right">Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((country, index) => (
            <tr key={country.country} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
              <td>{country.country}</td>
              <td className="text-right">{country.total}</td>
              <td className="text-right">{country.correct}</td>
              <td className="text-right">{country.accuracy.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CountryStats;
