// client/src/components/Signup.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '../constants';
import '../styles/Signup.css'; // Import the CSS file

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  profilePicture: File | null;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePicture: null,
  });
  const [error, setError] = useState<string>('');

  const { username, email, password, confirmPassword, profilePicture } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'profilePicture') {
      setFormData({ ...formData, profilePicture: e.target.files ? e.target.files[0] : null });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData();
    data.append('username', username);
    data.append('email', email);
    data.append('password', password);
    data.append('confirmPassword', confirmPassword); // Add confirmPassword to the form data
    if (profilePicture) {
      data.append('profilePicture', profilePicture);
    }

    try {
      const res = await axios.post(`${apiBaseUrl}/auth/signup`, data);
      console.log(res.data);

      const { username, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);

      navigate('/home');
    } catch (err: any) {
      console.error(err.response.data);
      setError(err.response.data.message);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={onSubmit}>
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
          <label>Confirm Password:</label>
          <input type="password" name="confirmPassword" value={confirmPassword} onChange={onChange} required />
        </div>
        <div>
          <label>Profile Picture:</label>
          <input type="file" name="profilePicture" onChange={onChange} />
        </div>
        <button type="submit">Sign Up</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default Signup;
