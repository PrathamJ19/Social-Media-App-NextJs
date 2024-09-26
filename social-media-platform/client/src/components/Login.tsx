// client/src/components/Login.tsx

import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '../constants';

interface FormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });

  const { email, password } = formData;

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${apiBaseUrl}/auth/login`, formData);
      console.log(res.data);
  
      const { username, token } = res.data;
      
      // Set the token and username in localStorage first
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      
      // Ensure that token is set before navigating
      if (localStorage.getItem('token')) {
        navigate('/home');
      } else {
        alert('Failed to set token. Please try again.');
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        console.error('Error response:', err.response.data);
        alert(err.response.data.message);
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
        <input
          type="email"
          name="email"
          value={email}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={onChange}
          required
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
