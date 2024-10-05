const API_URL = process.env.REACT_APP_API_URL || 'https://we-backend-lrmn.onrender.com/api';

export const fetchMatches = async (date) => {
  try {
    const response = await fetch(`${API_URL}/matches?date=${date}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
};

export const submitVote = async (matchId, vote) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ matchId, vote }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error submitting vote');
    }
    return await response.json();
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw error;
  }
};

export const getMatchVotes = async (matchId) => {
  try {
    const response = await fetch(`${API_URL}/match-votes/${matchId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching match votes:', error);
    throw error;
  }
};

export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const register = async (username, password, country) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, country }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/profile`, {
      headers: {
        'Authorization': token,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const getMatchDetails = async (matchId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/match/${matchId}`, {
      headers: {
        'Authorization': token,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch match details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching match details:', error);
    throw error;
  }
};

export const fetchAdminMatches = async (date) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/matches?date=${date}`, {
      headers: {
        'Authorization': token,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch admin matches');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching admin matches:', error);
    throw error;
  }
};

export const submitAdminPrediction = async (matchId, prediction) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ matchId, prediction }),
    });
    if (!response.ok) {
      throw new Error('Failed to submit admin prediction');
    }
    return await response.json();
  } catch (error) {
    console.error('Error submitting admin prediction:', error);
    throw error;
  }
};

export const getPredictionStats = async () => {
  try {
    const response = await fetch(`${API_URL}/prediction-stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch prediction statistics');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching prediction stats:', error);
    throw error;
  }
};

export const resetPredictions = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/admin/reset-predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to reset predictions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error resetting predictions:', error);
    throw error;
  }
};
