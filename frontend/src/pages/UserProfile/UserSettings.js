import React from 'react';
import { Link } from 'react-router-dom';
import './UserProfile.css';
import DeleteAccount from '../../components/DeleteAccount/DeleteAccount';

const UserSettings = () => (
  <div className="settings-container">
    <h1 className="settings-title">User Settings</h1>
    <hr className="settings-divider" />
    <ul className="settings-list">
      <li><Link className="settings-link" to="/settings/user/change-username/">Change Username</Link></li>
      <li><Link className="settings-link" to="/settings/user/change-nickname/">Change Nickname</Link></li>
      <li><Link className="settings-link" to="/settings/user/change-email/">Change Email</Link></li>
      <li><Link className="settings-link" to="/settings/user/change-password/">Change Password</Link></li>
    </ul>
    <Link className="back-button" to="/mypage/">Back</Link><br/>
    <DeleteAccount />
  </div>
);

export default UserSettings;
