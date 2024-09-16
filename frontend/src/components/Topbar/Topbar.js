import React from 'react';
import { Link } from 'react-router-dom';
import './Topbar.css';

const Topbar = () => {
  return (
    <header className="topbar">
      <h1>
        <Link to="/" className="topbar-link">English Learning</Link>
      </h1>
    </header>
  );
};

export default Topbar;
