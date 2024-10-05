import React, { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { fetchAdminMatches, submitAdminPrediction, resetPredictions } from '../api';

const AdminPanel = () => {
  const [matches, setMatches] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [resetConfirmation, setResetConfirmation] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, [currentDate]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      console.log('Fetching admin matches for date:', formattedDate);
      const fetchedMatches = await fetchAdminMatches(formattedDate);
      console.log('Received admin matches:', fetchedMatches);
      setMatches(fetchedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
    setLoading(false);
  };

  const handlePrediction = async (matchId, team, logo) => {
    try {
      await submitAdminPrediction(matchId, { team, logo });
      fetchMatches(); // Refresh matches after prediction
    } catch (error) {
      console.error('Error submitting admin prediction:', error);
    }
  };

  const changeDate = (days) => {
    setCurrentDate(prevDate => days > 0 ? addDays(prevDate, days) : subDays(prevDate, Math.abs(days)));
  };

  const handleResetClick = () => {
    setResetConfirmation(true);
  };

  const handleResetConfirm = async () => {
    try {
      await resetPredictions();
      alert('All predictions and votes have been reset successfully.');
      fetchMatches(); // Refresh the matches after reset
    } catch (error) {
      alert('Failed to reset predictions. Please try again.');
    } finally {
      setResetConfirmation(false);
    }
  };

  const handleResetCancel = () => {
    setResetConfirmation(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel - Match Predictions</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <button onClick={() => changeDate(-1)} className="px-4 py-2 bg-blue-500 text-white rounded">
            Previous Day
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded">
            {format(currentDate, 'dd/MM/yyyy')}
          </button>
          <button onClick={() => changeDate(1)} className="px-4 py-2 bg-blue-500 text-white rounded">
            Next Day
          </button>
        </div>
        <button onClick={handleResetClick} className="px-4 py-2 bg-red-500 text-white rounded">
          Reset All Predictions
        </button>
      </div>
      {matches.length === 0 ? (
        <p>No matches found for this date.</p>
      ) : (
        matches.map(match => (
          <div key={match.id} className="mb-4 p-4 border rounded">
            <div className="flex justify-between items-center mb-2">
              <span>{format(new Date(match.utcDate), 'HH:mm')}</span>
              <span>{match.competition.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => handlePrediction(match.id, match.homeTeam.name, match.homeTeam.crest)}
                className="flex items-center"
              >
                <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="w-6 h-6 mr-2" />
                {match.homeTeam.name}
              </button>
              <button
                onClick={() => handlePrediction(match.id, 'Draw', null)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Draw
              </button>
              <button
                onClick={() => handlePrediction(match.id, match.awayTeam.name, match.awayTeam.crest)}
                className="flex items-center"
              >
                {match.awayTeam.name}
                <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="w-6 h-6 ml-2" />
              </button>
            </div>
            {match.adminPrediction && (
              <div className="mt-2 text-sm text-gray-600">
                Current Prediction: {match.adminPrediction.team}
              </div>
            )}
          </div>
        ))
      )}
      {resetConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Reset</h2>
            <p className="mb-4">Are you sure you want to reset all predictions and votes? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button onClick={handleResetCancel} className="px-4 py-2 bg-gray-300 text-black rounded">
                Cancel
              </button>
              <button onClick={handleResetConfirm} className="px-4 py-2 bg-red-500 text-white rounded">
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;