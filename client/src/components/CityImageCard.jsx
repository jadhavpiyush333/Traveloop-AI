import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCityImage } from '../services/imageService';
import { Star, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CityImageCard = ({ city }) => {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      const url = await fetchCityImage(city.imageQuery || city.name);
      setImageUrl(url);
      setLoading(false);
    };
    loadImage();
  }, [city]);

  return (
    <motion.div
      onClick={() => navigate(`/destination/${city.id}`)}
      className="relative w-full h-[360px] rounded-2xl overflow-hidden shadow-lg group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Skeleton Loader */}
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Background Image */}
      {!loading && (
        <motion.img
          src={imageUrl}
          alt={city.name}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1 }}
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Persistent Bottom Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Normal View Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 flex justify-between items-end z-10">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1 drop-shadow-md">{city.name}</h2>
          <p className="text-gray-200 text-sm font-medium flex items-center gap-1">
            <MapPin size={14} /> {city.country}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white font-semibold flex items-center gap-1">
            <Star size={16} className="text-yellow-400 fill-yellow-400" /> {city.rating}
          </div>
        </div>
      </div>

      {/* Hover Panel (Glassmorphism Overlay) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm p-6 flex flex-col justify-center z-20"
          >
            <h3 className="text-2xl font-bold text-white mb-4 border-b border-white/20 pb-2">{city.name} Highlights</h3>
            
            <div className="space-y-3">
              {/* Top Places */}
              <div>
                <p className="text-gray-300 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                  <MapPin size={14} className="text-blue-400" /> Top Places
                </p>
                <div className="flex flex-wrap gap-2">
                  {city.places.map((place, idx) => (
                    <span key={idx} className="bg-white/10 text-white text-sm px-3 py-1 rounded-full border border-white/10">
                      {place}
                    </span>
                  ))}
                </div>
              </div>

              {/* Best Time to Visit */}
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Calendar size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase">Best Time to Visit</p>
                  <p className="text-white font-medium">{city.bestTime}</p>
                </div>
              </div>

              {/* Average Cost */}
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <DollarSign size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase">Avg. Trip Cost</p>
                  <p className="text-white font-medium">{city.cost}</p>
                </div>
              </div>
            </div>
            
            {/* Plan Trip Button */}
            <motion.button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/planner?city=${city.id}`);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all z-30"
            >
              Plan a Trip
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CityImageCard;
