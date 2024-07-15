// client/src/components/Signup.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    profilePicture: null,
  });
  const [error, setError] = useState('');

  const { username, email, password, profilePicture } = formData;

  const onChange = (e) => {
    if (e.target.name === 'profilePicture') {
      setFormData({ ...formData, profilePicture: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('username', username);
    data.append('email', email);
    data.append('password', password);
    if (profilePicture) {
      data.append('profilePicture', profilePicture);
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', data);
      console.log(res.data);

      const { username, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);

      navigate('/home');
    } catch (err) {
      console.error(err.response.data);
      setError(err.response.data.message);
    }
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div>
          <label>Username:</label>
          <input type="text" name="username" value={username} onChange={onChange} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={email} onChange={onChange} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" value={password} onChange={onChange} required />
        </div>
        <div>
          <label>Profile Picture:</label>
          <input type="file" name="profilePicture" onChange={onChange} />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Signup;
