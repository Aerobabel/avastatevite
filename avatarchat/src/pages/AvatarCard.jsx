// src/components/AvatarCard/AvatarCard.jsx
import '../AvatarCard.css'
import React, { useState } from 'react';
import { FaCheckCircle, FaUsers, FaInstagram, FaTwitter, FaLinkedin, FaBehance } from 'react-icons/fa';

const AvatarCard = ({ 
  avatarImage = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
  backgroundImage = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
  name = "Emma Johnson",
  title = "Professional Photographer",
  description = "Capturing life's beautiful moments through my lens. Specializing in portrait and landscape photography. Let's create something amazing together!",
  followers = "24.8K",
  verified = true
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  
  const handleInteraction = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="avatar-card">
      <div className="card-header" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="blur-overlay"></div>
        <div className="avatar-container">
          <div 
            className="avatar" 
            style={{ backgroundImage: `url(${avatarImage})` }}
          ></div>
        </div>
      </div>
      
      <div className="card-content">
        <h2 className="name">
          {name}
          {verified && <span className="verified"><FaCheckCircle /></span>}
        </h2>
        <div className="title">{title}</div>
        <p className="description">{description}</p>
        
        <div className="social-icons">
          <a href="#"><FaInstagram /></a>
          <a href="#"><FaTwitter /></a>
          <a href="#"><FaLinkedin /></a>
          <a href="#"><FaBehance /></a>
        </div>
      </div>
      
      <div className="card-footer">
        <div className="stats">
          <FaUsers className="user-icon" />
          <span>{followers} Followers</span>
        </div>
        <button 
          className={`interact-btn ${isFollowing ? 'following' : ''}`} 
          onClick={handleInteraction}
        >
          {isFollowing ? 'Following' : 'Interact'}
        </button>
      </div>
    </div>
  );
};

export default AvatarCard;