// client/src/components/Login.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${apiBaseUrl}/auth/login`, formData);
      console.log(res.data);

      const { username, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);

      navigate('/home');
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>Email:</label>
        <input type="email" name="email" value={email} onChange={onChange} required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" name="password" value={password} onChange={onChange} required />
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
