import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { apiBaseUrl } from '../constants';
import styles from '../styles/login.module.css'; // Import styles

interface FormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
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

      localStorage.setItem('token', token);
      localStorage.setItem('username', username);

      if (localStorage.getItem('token')) {
        window.location.href = '/home';
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
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.logo}>Link up</h1>
        <form onSubmit={onSubmit} className={styles.form}>
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
          <button type="submit" className={styles.button}>
            Log In
          </button>
        </form>
        <div className={styles.orContainer}>
          <div className={styles.line}></div>
          <span className={styles.orText}>OR</span>
          <div className={styles.line}></div>
        </div>
        <p className={styles.signupText}>
          Don't have an account?{' '}
          <a href="/signup" className={styles.signupLink}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
