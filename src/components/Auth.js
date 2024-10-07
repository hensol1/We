import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import Select from 'react-select';
import Flag from 'react-world-flags';
import { register, login, googleAuth, updateGoogleUser } from '../api';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState(null);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState([]);
  const [showGoogleUserForm, setShowGoogleUserForm] = useState(false);

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all')
      .then(response => response.json())
      .then(data => {
        const sortedCountries = data
          .map(country => ({
            value: country.cca2,
            label: country.name.common,
            flag: country.cca2.toLowerCase()
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCountries(sortedCountries);
      })
      .catch(error => console.error('Error fetching countries:', error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let data;
      if (isLogin) {
        data = await login(username, password);
      } else {
        if (!country) {
          setError('Please select a country');
          return;
        }
        data = await register(username, password, email, country.value);
      }
      onLogin(data);
    } catch (error) {
      setError(error.message || 'An error occurred');
    }
  };

const handleGoogleSuccess = async (credentialResponse) => {
  try {
    const data = await googleAuth(credentialResponse.credential);
    if (data.needsAdditionalInfo) {
      setShowGoogleUserForm(true);
    } else {
      onLogin(data);
    }
  } catch (error) {
    console.error('Failed to login with Google:', error);
    setError('Failed to login with Google. Please try again.');
  }
};
  const handleGoogleUserSubmit = async (e) => {
    e.preventDefault();
    if (!username || !country) {
      setError('Please provide both username and country');
      return;
    }
    try {
      const data = await updateGoogleUser(username, country.value);
      onLogin(data);
    } catch (error) {
      setError('Failed to update user info');
    }
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
      padding: '8px',
    }),
    singleValue: (provided, state) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
    }),
  };

  const formatOptionLabel = ({ value, label, flag }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Flag code={flag} height="16" style={{ marginRight: '8px' }} />
      {label}
    </div>
  );

  if (showGoogleUserForm) {
    return (
      <form onSubmit={handleGoogleUserSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div>
          <label htmlFor="username" className="block mb-1">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="country" className="block mb-1">Country</label>
          <Select
            options={countries}
            value={country}
            onChange={setCountry}
            styles={customStyles}
            formatOptionLabel={formatOptionLabel}
            placeholder="Select a country"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
          Complete Registration
        </button>
      </form>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">{isLogin ? 'Login' : 'Register'}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block mb-1">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        {!isLogin && (
          <div>
            <label htmlFor="email" className="block mb-1">Email (optional)</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        )}
        <div>
          <label htmlFor="password" className="block mb-1">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        {!isLogin && (
          <div>
            <label htmlFor="country" className="block mb-1">Country</label>
            <Select
              options={countries}
              value={country}
              onChange={setCountry}
              styles={customStyles}
              formatOptionLabel={formatOptionLabel}
              placeholder="Select a country"
            />
          </div>
        )}
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <div className="mt-4">
        <GoogleLogin
          clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google Sign In was unsuccessful')}
        />
      </div>
      <p className="mt-4 text-center">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button onClick={() => setIsLogin(!isLogin)} className="text-blue-500">
          {isLogin ? 'Register' : 'Login'}
        </button>
      </p>
    </div>
  );
};

export default Auth;