import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign, Star, ArrowLeft, Image as ImageIcon, Moon, Clock } from 'lucide-react';
import { citiesData } from '../data/citiesData';
import { fetchCityImage } from '../services/imageService';

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const city = Object.values(citiesData).find(c => c.id === id);

  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (city) {
      const loadImage = async () => {
        setLoading(true);
        const url = await fetchCityImage(city.imageQuery || city.name);
        setImageUrl(url);
        setLoading(false);
      };
      loadImage();
    }
  }, [city]);

  if (!city) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h1 className="text-3xl font-bold text-white mb-4">Destination Not Found</h1>
        <button onClick={() => navigate('/destinations')} className="text-blue-400 hover:underline">
          Return to Destinations
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 bg-gray-900 animate-pulse flex items-center justify-center">
            <ImageIcon className="text-gray-700 w-16 h-16" />
          </div>
        ) : (
          <motion.img 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            src={imageUrl} 
            alt={city.name} 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
        
        {/* Top Bar Navigation */}
        <div className="absolute top-24 left-8 z-20">
          <button 
            onClick={() => navigate('/destinations')}
            className="flex items-center gap-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full transition-all border border-white/10"
          >
            <ArrowLeft size={18} /> Back to Destinations
          </button>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-2 text-blue-400 font-medium mb-3 tracking-widest uppercase text-sm"
              >
                <MapPin size={16} /> {city.country}
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-xl"
              >
                {city.name}
              </motion.h1>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <button 
                onClick={() => navigate(`/planner?city=${city.id}`)}
                className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:scale-105 transition-all text-lg whitespace-nowrap flex items-center gap-2"
              >
                Start Planning <ArrowLeft size={18} className="rotate-180" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Star className="text-yellow-400" /> Top Places to Visit
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {city.places.map((place, idx) => {
                  // Consistent cost multiplier logic
                  const baseVal = parseInt(city.cost.split('–')[0].replace(/[^0-9]/g, ''), 10) || 50000;
                  const mult = Math.max(0.5, baseVal / 40000);
                  const estPrice = Math.floor((2500 + (idx * 500)) * mult);
                  
                  return (
                    <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-medium text-white">{place}</h3>
                        <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">
                          ₹{estPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm flex items-center gap-1">
                        <MapPin size={12} className="text-blue-400"/> Iconic Landmark
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* Night Life Section - NEW */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-3xl p-8 border border-white/10"
            >
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Moon className="text-purple-400" /> Evening & Nightlife
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "Rooftop Lounge", desc: "Panoramic city views with cocktails", cost: 4500 },
                  { name: "Local Night Market", desc: "Evening street food and shopping", cost: 1200 }
                ].map((item, idx) => {
                  const baseVal = parseInt(city.cost.split('–')[0].replace(/[^0-9]/g, ''), 10) || 50000;
                  const mult = Math.max(0.5, baseVal / 40000);
                  const scaledCost = Math.floor(item.cost * mult);
                  
                  return (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="bg-purple-500/10 p-3 rounded-xl text-purple-400">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{item.name}</h4>
                        <p className="text-sm text-gray-400">{item.desc}</p>
                        <p className="text-xs text-purple-400 font-bold mt-1">Est. Cost: ₹{scaledCost.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>
            
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
               <h2 className="text-2xl font-bold mb-4">About {city.name}</h2>
               <p className="text-gray-300 leading-relaxed text-lg">
                 Welcome to {city.name}, a crown jewel of {city.country}. Whether you're drawn by the breathtaking landscapes, the rich cultural heritage, or the vibrant city life, {city.name} offers an unforgettable experience. Use our Trip Planner to automatically build a day-by-day itinerary incorporating the best local sights, hidden gems, and top-rated experiences perfectly tailored to your schedule.
               </p>
            </motion.section>
          </div>

          {/* Sidebar Stats */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="space-y-6"
          >
            {/* Quick Facts */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Trip Details</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Best Time to Visit</p>
                    <p className="text-white font-medium text-lg">{city.bestTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-500/20 p-3 rounded-xl text-green-400">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Estimated Cost</p>
                    <p className="text-white font-medium text-lg">{city.cost}</p>
                    <p className="text-gray-500 text-xs mt-1">For a typical 4-5 day trip</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-500/20 p-3 rounded-xl text-yellow-400">
                    <Star size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Traveler Rating</p>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium text-lg">{city.rating} / 5.0</p>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < Math.floor(city.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 p-8 rounded-3xl text-center">
              <h3 className="text-xl font-bold mb-2">Ready to explore?</h3>
              <p className="text-gray-400 text-sm mb-6">Build your day-by-day itinerary in seconds.</p>
              <button 
                onClick={() => navigate(`/planner?city=${city.id}`)}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Start Planning
              </button>
            </div>
            
          </motion.div>
          
        </div>
      </div>
    </main>
  );
};

export default DestinationDetail;
