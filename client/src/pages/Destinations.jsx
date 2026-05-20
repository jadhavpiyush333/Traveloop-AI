import React, { useState } from 'react';
import CityImageCard from '../components/CityImageCard';
import { citiesData } from '../data/citiesData';
import { Search } from 'lucide-react';

const Destinations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const allCities = Object.values(citiesData);

  const filteredCities = allCities.filter(city => 
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    city.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="pt-32 pb-20 px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Global Destinations</span>
            </h1>
            <p className="text-gray-400">Find your next adventure from our curated list of places.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by city or country..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors backdrop-blur-md"
            />
          </div>
        </div>

        {filteredCities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCities.map((city, index) => (
              <CityImageCard key={index} city={city} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-2">No destinations found</h3>
            <p className="text-gray-400">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Destinations;
