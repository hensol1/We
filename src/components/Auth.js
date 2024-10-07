import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Flag from 'react-world-flags';
import { GoogleLogin } from '@react-oauth/google';
import { register, login } from '../api';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countries, setCountries] = useState([]);
  const [showUserInfoForm, setShowUserInfoForm] = useState(false);
  const [googleUserId, setGoogleUserId] = useState(null);

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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('Google credential response:', credentialResponse);
      const result = await fetch(`${process.env.REACT_APP_API_URL}/auth/google/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await result.json();
      console.log('Backend response:', data);
      if (data.needsUsername || data.needsCountry) {
        setShowUserInfoForm(true);
        setGoogleUserId(data.userId);
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        onLogin({ username: data.username || data.email, userId: data.userId });
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError(`Failed to login with Google. ${error.message}`);
    }
  };

  const handleUserInfoSubmit = async (e) => {
    e.preventDefault();
    if (!username || !country) {
      setError('Please provide both username and country');
      return;
    }
    try {
      const result = await fetch(`${process.env.REACT_APP_API_URL}/api/update-user-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: googleUserId, username, country: country.value }),
      });
      if (!result.ok) {
        throw new Error('Failed to update user info');
      }
      const data = await result.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      onLogin({ username, userId: data.userId });
    } catch (error) {
      console.error('User info update error:', error);
      setError('Failed to update user info. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      if (isLogin) {
        const data = await login(username, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        onLogin({ username, userId: data.userId });
      } else {
        if (!country) {
          setError('Please select a country');
          return;
        }
        await register(username, email, password, country.value);
        setSuccessMessage('Registration successful! You can now log in.');
        setIsLogin(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
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
      <div style={{ width: '24px', height: '18px', marginRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Flag
          code={flag}
          height="16"
          width="22"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </div>
      {label}
    </div>
  );

  return (
    <div className="max-w-md mx-auto mt-8">
      {showUserInfoForm ? (
        <form onSubmit={handleUserInfoSubmit} className="space-y-4">
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
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">{isLogin ? 'Login' : 'Register'}</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
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
                <label htmlFor="email" className="block mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
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
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.log('Login Failed');
                setError('Failed to login with Google. Please try again.');
              }}
            />
          </div>
          <p className="mt-4 text-center">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-500">
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </>
      )}
    </div>
  );
};

export default Auth;