import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { apiBaseUrl } from '../constants';
import styles from '../styles/signup.module.css';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  profilePicture: File | null;
}

const Signup: React.FC = () => {
  const router = useRouter();
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
    data.append('confirmPassword', confirmPassword);
    if (profilePicture) {
      data.append('profilePicture', profilePicture);
    }

    try {
      const res = await axios.post(`${apiBaseUrl}/auth/signup`, data);
      console.log(res.data);

      const { username, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);

      router.push('/home');
    } catch (err: any) {
      console.error(err.response.data);
      setError(err.response.data.message);
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupFormWrapper}>
        <h1 className={styles.logo}>Link up</h1>
        <form className={styles.signupForm} onSubmit={onSubmit}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="Username"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputContainer}>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Email"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputContainer}>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Password"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputContainer}>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              placeholder="Confirm Password"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputContainer}>
            <input
              type="file"
              name="profilePicture"
              onChange={onChange}
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.button}>
            Sign Up
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
        <div className={styles.orContainer}>
          <div className={styles.line}></div>
          <span className={styles.orText}>OR</span>
          <div className={styles.line}></div>
        </div>
        <p className={styles.loginRedirect}>
          Have an account?{' '}
          <a href="/login" className={styles.loginLink}>
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
