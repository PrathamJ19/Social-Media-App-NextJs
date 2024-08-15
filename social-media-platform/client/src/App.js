// client/src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/Home';
import Profile from './components/Profile';
import PostPage from './components/PostPage'; 
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/home' element={<Home />} />
        <Route path='/profile/:username' element={<Profile />} /> {/* Add route for profile */}
        <Route path="/post/:postId" element={<PostPage />} />
      </Routes>
    </Router>
  );
}

export default App;
