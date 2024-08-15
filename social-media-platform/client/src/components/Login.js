// client/src/components/Login.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '../constants';



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
      if (err.response && err.response.data) {
        console.error('Error response:', err.response.data);
        alert(err.response.data.message); // Display the error message
      } else {
        console.error('Error:', err);
        alert('An error occurred. Please try again.');
      }
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
