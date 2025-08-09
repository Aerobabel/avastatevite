// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserButton, useAuth } from '@clerk/clerk-react';
import AvatarCard from './AvatarCard';
import '../index.css';



const HomePage = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  // Redirect to /auth if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/auth');
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded || !isSignedIn) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const [avatars, setAvatars] = useState([
    {
      id: '1',
      name: 'Sarah',
      description: 'Friendly AI assistant with knowledge of space exploration',
      image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=500',
      rating: 4.8,
      followers: "12.4K"
    },
    {
      id: '2',
      name: 'Orion',
      description: 'Expert in ancient mythology and storytelling',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500',
      rating: 4.5,
      followers: "8.7K"
    },
    {
      id: '3',
      name: 'Nova',
      description: 'Science and technology enthusiast with a passion for innovation',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500',
      rating: 4.9,
      followers: "15.2K"
    },
    {
      id: '4',
      name: 'Kai',
      description: 'Multilingual conversationalist with a focus on cultural exchange',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=500',
      rating: 4.7,
      followers: "10.9K"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // Filter avatars based on search term
  const filteredAvatars = avatars.filter(avatar =>
    avatar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    avatar.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center w-full md:w-auto">
          <Link
            to="/CreateAvatar"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create Avatar
          </Link>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search avatars by name or description..."
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-2.5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-indigo-900">Avatar Chat</h1>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Display search results count */}
      {searchTerm && (
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            Found {filteredAvatars.length} avatar{filteredAvatars.length !== 1 ? 's' : ''} matching "{searchTerm}"
          </p>
        </div>
      )}

      {/* Avatar Cards Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {filteredAvatars.map((avatar) => {
    const card = (
      <AvatarCard
        key={avatar.id}
        avatarImage={avatar.image}
        name={avatar.name}
        title={`Rating: ${avatar.rating}`}
        description={avatar.description}
        followers={avatar.followers}
        verified={avatar.rating > 4.5}
      />
    );

    // Only Sarah gets linked to MetaChat:
    if (avatar.name === 'Sarah') {
      return (
        <Link
          key={avatar.id}
          to={`/SarahChatpage`}
          state={{ avatar }}
          className="block"
        >
          {card}
        </Link>
      );
    }

    // Others stay as plain cards
    return <div key={avatar.id}>{card}</div>;
  })}
</div>


      {/* Show message when no results found */}
      {filteredAvatars.length === 0 && (
        <div className="text-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700">No avatars found</h3>
          <p className="text-gray-500 mt-2">
            We couldn't find any avatars matching "{searchTerm}"
          </p>
          <button
            className="mt-4 text-indigo-600 hover:text-indigo-800"
            onClick={() => setSearchTerm('')}
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
