import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <NavLink 
            to="/english-exercise/word/"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Word Quiz
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/english-exercise/idiom/"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Idiom Quiz
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/english-exercise/sentence/"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Sentence Quiz
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/english-exercise/long-reading/"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Long Sentence Quiz
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/ranking/"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Ranking
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/mypage/"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            My Page
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
