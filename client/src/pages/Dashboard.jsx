import React from 'react';
import { Link } from 'react-router-dom';
import CityImageCard from '../components/CityImageCard';
import { citiesData } from '../data/citiesData';

const Dashboard = () => {
  // Show all cities as destinations
  const trendingCities = Object.values(citiesData);

  return (
    <main className="pt-32 pb-20 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Discover your next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              great adventure.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Smart destination insights, real-time budget tracking, and personalized itineraries all in one place.
          </p>
        </div>

        {/* Trending Destinations Section */}
        <div>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Trending Destinations</h2>
              <p className="text-gray-400">Popular places to visit right now</p>
            </div>
            <Link to="/destinations" className="text-blue-400 hover:text-blue-300 font-medium">
              View all
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingCities.map((city, index) => (
              <CityImageCard key={index} city={city} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
