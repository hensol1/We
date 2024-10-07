const API_URL = `${process.env.REACT_APP_API_URL}/api`;

export const fetchMatches = async (date) => {
  try {
    const response = await fetch(`${API_URL}/matches?date=${date}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
};

export const register = async (username, password, email, country) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, email, country }),
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

export const googleAuth = async (token) => {
  try {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Google authentication failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Error with Google authentication:', error);
    throw error;
  }
};

export const updateGoogleUser = async (username, country) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/update-google-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ username, country }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user info');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating Google user info:', error);
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

export const getUserVotesAndPercentages = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/user-votes`, {
      headers: {
        'Authorization': token,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user votes and percentages');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user votes and percentages:', error);
    throw error;
  }
};

