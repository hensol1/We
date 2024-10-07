import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import MatchesDashboard from './components/MatchesDashboard';
import Auth from './components/Auth';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import PredictionStats from './components/PredictionStats';
import { getUserProfile } from './api';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUser(profile);
      setIsAdmin(profile.isAdmin);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setShowAuth(false);
    setUser(userData);
    fetchUserProfile(); // Fetch full profile after login
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setShowProfile(false);
    setShowAdminPanel(false);
    setIsAdmin(false);
    setUser(null);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="container mx-auto px-4">
        <PredictionStats />
        <nav className="flex justify-between items-center py-4 mb-4">
          <h1 className="text-2xl font-bold">We Know Better</h1>
          <div className="flex items-center">
            {isLoggedIn && user && (
              <span className="mr-4">Welcome, {user.username}</span>
            )}
            {isLoggedIn ? (
              <>
                <button onClick={() => setShowProfile(!showProfile)} className="mr-4">
                  {showProfile ? 'Show Matches' : 'Profile'}
                </button>
                {isAdmin && (
                  <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="mr-4">
                    {showAdminPanel ? 'Show Matches' : 'Admin Panel'}
                  </button>
                )}
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)} className="bg-blue-500 text-white px-4 py-2 rounded">Login / Sign Up</button>
            )}
          </div>
        </nav>

        {showAuth && !isLoggedIn && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <Auth onLogin={handleLogin} />
                <div className="mt-2">
                  <button onClick={() => setShowAuth(false)} className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAdminPanel && isAdmin ? (
          <AdminPanel />
        ) : showProfile && isLoggedIn ? (
          <Profile user={user} />
        ) : (
          <MatchesDashboard isLoggedIn={isLoggedIn} />
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;