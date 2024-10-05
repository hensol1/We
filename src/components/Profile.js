import React, { useState, useEffect } from 'react';
import { getUserProfile, getMatchDetails } from '../api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [matchDetails, setMatchDetails] = useState({});
  const [leagueStats, setLeagueStats] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
        fetchMatchDetails(data.votes);
      } catch (error) {
        setError('Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const fetchMatchDetails = async (votes) => {
    const details = {};
    for (const vote of votes) {
      try {
        const matchData = await getMatchDetails(vote.matchId);
        details[vote.matchId] = matchData;
      } catch (error) {
        console.error(`Error fetching match details for ${vote.matchId}:`, error);
      }
    }
    setMatchDetails(details);
    calculateLeagueStats(votes, details);
  };

  const isVoteCorrect = (vote, match) => {
    if (!match || match.status !== 'FINISHED' || !match.score || !match.score.fullTime) return null;

    const homeScore = match.score.fullTime.home;
    const awayScore = match.score.fullTime.away;

    if (homeScore > awayScore && vote === 'HOME') return true;
    if (homeScore < awayScore && vote === 'AWAY') return true;
    if (homeScore === awayScore && vote === 'DRAW') return true;

    return false;
  };

  const calculateLeagueStats = (votes, matchDetails) => {
    const leagueData = {};

    votes.forEach(vote => {
      const match = matchDetails[vote.matchId];
      if (match && match.competition) {
        const leagueId = match.competition.id;
        const leagueName = match.competition.name;
        const leagueLogo = match.competition.emblem; // Assuming the API returns the logo URL
        
        if (!leagueData[leagueId]) {
          leagueData[leagueId] = { name: leagueName, logo: leagueLogo, total: 0, correct: 0 };
        }

        const result = isVoteCorrect(vote.vote, match);
        if (result !== null) {
          leagueData[leagueId].total++;
          if (result) leagueData[leagueId].correct++;
        }
      }
    });

    const stats = Object.values(leagueData).map(league => ({
      ...league,
      accuracy: league.total > 0 ? (league.correct / league.total) * 100 : 0
    }));

    stats.sort((a, b) => b.accuracy - a.accuracy);
    setLeagueStats(stats);
  };

  if (error) return <div className="text-red-500">{error}</div>;
  if (!profile) return <div>Loading...</div>;

  const votesWithResults = profile.votes.map(vote => {
    const match = matchDetails[vote.matchId];
    return {
      ...vote,
      correct: match ? isVoteCorrect(vote.vote, match) : null
    };
  });

  const finishedVotes = votesWithResults.filter(vote => vote.correct !== null);
  const correctVotes = finishedVotes.filter(vote => vote.correct).length;
  const accuracy = finishedVotes.length > 0 ? (correctVotes / finishedVotes.length) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <p>Username: {profile.username}</p>
      <p>Total Votes: {profile.votes.length}</p>
      <p>Votes on Finished Matches: {finishedVotes.length}</p>
      <p>Correct Predictions: {correctVotes}</p>
      <p>Overall Accuracy: {accuracy.toFixed(2)}%</p>

      <h3 className="text-xl font-bold mt-6 mb-2">Prediction Accuracy by League</h3>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">League</th>
            <th className="text-right">Votes</th>
            <th className="text-right">Correct</th>
            <th className="text-right">Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {leagueStats.map((league, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
              <td className="flex items-center">
                <img src={league.logo} alt={league.name} className="w-6 h-6 mr-2" />
                {league.name}
              </td>
              <td className="text-right">{league.total}</td>
              <td className="text-right">{league.correct}</td>
              <td className="text-right">{league.accuracy.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-xl font-bold mt-6 mb-2">Voting History</h3>
      <ul className="space-y-2">
        {votesWithResults.map((vote, index) => {
          const match = matchDetails[vote.matchId];
          return (
            <li key={index} className={`p-2 rounded ${
              vote.correct === true ? 'bg-green-100' : 
              vote.correct === false ? 'bg-red-100' : 
              'bg-gray-100'
            }`}>
              {match ? (
                <>
                  <div className="flex items-center mb-1">
                    <img src={match.competition.emblem} alt={match.competition.name} className="w-4 h-4 mr-1" />
                    <span>{match.competition.name}:</span>
                  </div>
                  {match.homeTeam.name} vs {match.awayTeam.name}, 
                  Vote: {vote.vote}, 
                  {vote.correct === true ? 'Correct' : 
                   vote.correct === false ? 'Incorrect' : 
                   'Pending'}
                </>
              ) : (
                `Loading match details...`
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Profile;