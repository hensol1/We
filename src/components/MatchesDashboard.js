import React, { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns'
import { fetchMatches, submitVote, getMatchVotes } from '../api';

const MatchesDashboard = ({ isLoggedIn }) => {
  const [matches, setMatches] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [votedMatches, setVotedMatches] = useState({});

  useEffect(() => {
    fetchMatchesData(currentDate);
  }, [currentDate]);

const renderPredictions = (match) => {
  const isFinished = match.status === "FINISHED";
  let actualResult = null;
  
  if (isFinished) {
    const homeScore = match.score.fullTime.home;
    const awayScore = match.score.fullTime.away;
    if (homeScore > awayScore) {
      actualResult = match.homeTeam.name;
    } else if (awayScore > homeScore) {
      actualResult = match.awayTeam.name;
    } else {
      actualResult = "Draw";
    }
  }

  const fansPredictionCorrect = isFinished && 
    ((match.fansPrediction?.team === match.homeTeam.name && actualResult === match.homeTeam.name) ||
     (match.fansPrediction?.team === match.awayTeam.name && actualResult === match.awayTeam.name) ||
     (match.fansPrediction?.team === "Draw" && actualResult === "Draw"));

  const adminPredictionCorrect = isFinished && 
    ((match.adminPrediction?.team === match.homeTeam.name && actualResult === match.homeTeam.name) ||
     (match.adminPrediction?.team === match.awayTeam.name && actualResult === match.awayTeam.name) ||
     (match.adminPrediction?.team === "Draw" && actualResult === "Draw"));

  return (
    <div className="text-sm text-gray-600 mt-1 flex justify-between">
      <div className={`${isFinished ? (fansPredictionCorrect ? 'bg-green-200' : 'bg-red-200') : ''} px-2 py-1 rounded`}>
        Fans Prediction: 
        {match.fansPrediction?.logo && (
          <img 
            src={match.fansPrediction.logo} 
            alt={match.fansPrediction.team} 
            className="w-4 h-4 inline mx-1"
          />
        )}
        {match.fansPrediction?.team}
      </div>
      <div className={`${isFinished ? (adminPredictionCorrect ? 'bg-green-200' : 'bg-red-200') : ''} px-2 py-1 rounded`}>
        AI Prediction: 
        {match.adminPrediction?.logo && (
          <img 
            src={match.adminPrediction.logo} 
            alt={match.adminPrediction.team} 
            className="w-4 h-4 inline mx-1"
          />
        )}
        {match.adminPrediction?.team}
      </div>
    </div>
  );
};

  const fetchMatchesData = async (date) => {
    try {
      console.log('Fetching matches for date:', date);
      const formattedDate = format(date, 'yyyy-MM-dd');
      const data = await fetchMatches(formattedDate);
      console.log('Received matches:', data);
      
      // Fetch vote percentages for each match
      const matchesWithVotes = await Promise.all(data.map(async (match) => {
        const votePercentages = await getMatchVotes(match.id);
              console.log('Match with admin prediction:', match.adminPrediction);
        return { ...match, votePercentages };
      }));

      setMatches(matchesWithVotes);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleVote = async (matchId, vote) => {
    if (!isLoggedIn) {
      alert('Please log in to vote');
      return;
    }
    if (votedMatches[matchId]) {
      alert('You have already voted for this match');
      return;
    }
    try {
      const { percentages } = await submitVote(matchId, vote);
      setMatches(matches.map(match => 
        match.id === matchId ? { ...match, votePercentages: percentages } : match
      ));
      setVotedMatches({ ...votedMatches, [matchId]: true });
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert(error.message);
    }
  };

  const renderVoteButtons = (match) => {
    if (["SCHEDULED", "TIMED"].includes(match.status)) {
      const hasVoted = votedMatches[match.id];
      return (
        <div className="flex justify-center space-x-2 mt-2">
          <VoteButton match={match} vote="HOME" onClick={() => handleVote(match.id, 'HOME')} showPercentage={hasVoted} />
          <VoteButton match={match} vote="DRAW" onClick={() => handleVote(match.id, 'DRAW')} showPercentage={hasVoted} />
          <VoteButton match={match} vote="AWAY" onClick={() => handleVote(match.id, 'AWAY')} showPercentage={hasVoted} />
        </div>
      );
    }
    return null;
  };

  const VoteButton = ({ match, vote, onClick, showPercentage }) => {
    const percentage = match.votePercentages?.[vote] || 0;
    const isVoted = votedMatches[match.id];
    const bgColor = vote === 'HOME' ? 'bg-blue-500' : vote === 'DRAW' ? 'bg-gray-500' : 'bg-red-500';
    
    return (
      <button 
        onClick={onClick} 
        disabled={isVoted}
        className={`px-2 py-1 ${bgColor} text-white rounded text-sm ${isVoted ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {vote} {showPercentage ? `(${percentage}%)` : ''}
      </button>
    );
  };

  const changeDate = (days) => {
    setCurrentDate(prevDate => days > 0 ? addDays(prevDate, days) : subDays(prevDate, Math.abs(days)));
  };

  const setToday = () => {
    setCurrentDate(new Date());
  };

  const renderScore = (match) => {
    if (["IN_PLAY", "HALFTIME", "PAUSED", "LIVE"].includes(match.status)) {
      return `${match.score.fullTime.home} - ${match.score.fullTime.away}`;
    }
    if (match.status === "FINISHED") {
      return `${match.score.fullTime.home} - ${match.score.fullTime.away}`;
    }
    return format(new Date(match.utcDate), 'HH:mm');
  };

  const sortedMatches = matches.sort((a, b) => {
    const statusOrder = ["IN_PLAY", "HALFTIME", "PAUSED", "LIVE"];
    const aIndex = statusOrder.indexOf(a.status);
    const bIndex = statusOrder.indexOf(b.status);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });

  const groupedMatches = sortedMatches.reduce((acc, match) => {
    if (!acc[match.competition.id]) {
      acc[match.competition.id] = [];
    }
    acc[match.competition.id].push(match);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4">
      <nav className="flex justify-center space-x-4 my-4">
        <button onClick={() => changeDate(-1)} className="px-4 py-2 bg-blue-500 text-white rounded">
          Previous Day
        </button>
        <button onClick={setToday} className="px-4 py-2 bg-green-500 text-white rounded">
          Today ({format(new Date(), 'dd/MM/yyyy')})
        </button>
        <button onClick={() => changeDate(1)} className="px-4 py-2 bg-blue-500 text-white rounded">
          Next Day
        </button>
      </nav>
      <div className="text-center mb-4">
        Selected Date: {format(currentDate, 'dd/MM/yyyy')}
      </div>

      {Object.entries(groupedMatches).map(([leagueId, leagueMatches]) => (
        <div key={leagueId} className="mb-8 w-1/2 mx-auto">
          <div className="flex items-center mb-4">
            <img src={leagueMatches[0].competition.emblem} alt={leagueMatches[0].competition.name} className="w-8 h-8 mr-2" />
            <h2 className="text-xl font-bold">{leagueMatches[0].competition.name}</h2>
          </div>
          <div className="space-y-2">
            {leagueMatches.map(match => (
              <div key={match.id} className="bg-gray-100 p-2 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center w-2/5">
                    <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="w-6 h-6 mr-2" />
                    <span className="truncate">{match.homeTeam.name}</span>
                  </div>
                  <div className="w-1/5 text-center">
                    <span className="font-bold">{renderScore(match)}</span>
                    <div className="text-xs text-gray-500">{match.status}</div>
                  </div>
                  <div className="flex items-center justify-end w-2/5">
                    <span className="truncate">{match.awayTeam.name}</span>
                    <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="w-6 h-6 ml-2" />
                  </div>
                </div>
                {renderPredictions(match)}
                {renderVoteButtons(match)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchesDashboard;
