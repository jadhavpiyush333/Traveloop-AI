import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, DollarSign, Plus, Check, Clock, Info } from 'lucide-react';
import { citiesData } from '../data/citiesData';

const Planner = () => {
  const [searchParams] = useSearchParams();
  const initialCityId = searchParams.get('city');

  // Find the initial city if it exists in data
  const initialCity = initialCityId ? Object.values(citiesData).find(c => c.id === initialCityId) : null;

  // State
  const [selectedCities, setSelectedCities] = useState(initialCity ? [initialCity] : []);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [tripDays, setTripDays] = useState(3);
  
  // Itinerary state
  const [itinerary, setItinerary] = useState([]); // [{ id, name, city, day }]
  
  // Budget state
  const [targetBudget, setTargetBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  // When selected cities change, calculate dynamic target budget based on average min cost
  useEffect(() => {
    let newTarget = 0;
    selectedCities.forEach(city => {
      // Parse "₹25,000 – ₹60,000" to get 25000
      const costStr = city.cost.split('–')[0].replace(/[^0-9]/g, '');
      if (costStr) {
        newTarget += parseInt(costStr, 10);
      }
    });
    setTargetBudget(newTarget || 50000); // Default if no cities
  }, [selectedCities]);

  // Derived available activities based on selected cities
  const allGeneratedActivities = [];
  selectedCities.forEach(city => {
    // 1. Add real places from citiesData
    city.places.forEach(place => {
      allGeneratedActivities.push({
        id: `${city.id}-${place.replace(/\s+/g, '-').toLowerCase()}`,
        name: place,
        city: city.name,
        estimatedCost: Math.floor(Math.random() * 3000) + 500
      });
    });

    // 2. Generate dynamic filler activities based on the number of trip days
    // We want at least ~3-4 activities per day total across all selected cities.
    const neededActivitiesPerCity = Math.ceil((tripDays * 4) / selectedCities.length);
    
    const genericTemplates = [
      "Local Market Tour", "Sunset Viewpoint", "Historic Museum Visit", 
      "Traditional Dinner", "City Walking Tour", "Boat/River Cruise", 
      "Art Gallery Tour", "Shopping District", "Nature Park Hike", 
      "Street Food Tasting", "Nightlife Experience", "Cultural Show",
      "Cooking Class", "Bike Rental & Tour", "Coffee Shop Hopping",
      "Rooftop Bar Experience", "Local Craft Workshop", "Photography Walk"
    ];

    let generatedCount = city.places.length;
    let templateIdx = 0;
    
    while (generatedCount < neededActivitiesPerCity && templateIdx < genericTemplates.length) {
      allGeneratedActivities.push({
        id: `${city.id}-generic-${templateIdx}`,
        name: `${city.name} ${genericTemplates[templateIdx]}`,
        city: city.name,
        estimatedCost: Math.floor(Math.random() * 2000) + 500
      });
      generatedCount++;
      templateIdx++;
    }
  });

  const availableActivities = allGeneratedActivities.filter(activity => !itinerary.some(item => item.id === activity.id));

  const handleAddCity = (e) => {
    e.preventDefault();
    if (!selectedCityId) return;
    
    const cityObj = Object.values(citiesData).find(c => c.id === selectedCityId);
    if (cityObj && !selectedCities.find(c => c.id === cityObj.id)) {
      setSelectedCities([...selectedCities, cityObj]);
    }
    setSelectedCityId('');
  };

  const handleRemoveCity = (idToRemove) => {
    setSelectedCities(selectedCities.filter(c => c.id !== idToRemove));
    // Also remove activities from itinerary that belong to this city
    const cityToRemove = selectedCities.find(c => c.id === idToRemove);
    if (cityToRemove) {
      const newItinerary = itinerary.filter(item => item.city !== cityToRemove.name);
      setItinerary(newItinerary);
      // recalculate spent
      setTotalSpent(newItinerary.reduce((sum, item) => sum + item.estimatedCost, 0));
    }
  };

  const handleAddActivity = (activity) => {
    const newItem = { ...activity, day: 1 }; // Default to day 1
    setItinerary([...itinerary, newItem]);
    setTotalSpent(prev => prev + activity.estimatedCost);
  };

  const handleRemoveActivity = (idToRemove) => {
    const itemToRemove = itinerary.find(i => i.id === idToRemove);
    if (itemToRemove) {
      setTotalSpent(prev => prev - itemToRemove.estimatedCost);
    }
    setItinerary(itinerary.filter(i => i.id !== idToRemove));
  };

  const handleMoveActivity = (id, newDay) => {
    setItinerary(itinerary.map(item => 
      item.id === id ? { ...item, day: parseInt(newDay, 10) } : item
    ));
  };

  const progressPercentage = targetBudget > 0 ? Math.min((totalSpent / targetBudget) * 100, 100) : 0;
  const isOverBudget = totalSpent > targetBudget;

  return (
    <main className="pt-32 pb-20 px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Dynamic Itinerary</span>
          </h1>
          <p className="text-gray-400">Select destinations to unlock activities, and watch your budget update in real-time.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Settings & Activities */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Destinations Widget */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="text-blue-400" /> Destinations
              </h2>
              
              <div className="space-y-3 mb-6">
                <AnimatePresence>
                  {selectedCities.map((city) => (
                    <motion.div 
                      key={city.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-black/20 px-4 py-3 rounded-xl border border-white/5 flex items-center justify-between overflow-hidden"
                    >
                      <div>
                        <span className="font-medium text-white">{city.name}</span>
                        <p className="text-xs text-gray-400">{city.country}</p>
                      </div>
                      <button onClick={() => handleRemoveCity(city.id)} className="text-gray-500 hover:text-red-400 p-2">&times;</button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {selectedCities.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">No destinations selected.</p>
                )}
              </div>

              <form onSubmit={handleAddCity} className="flex gap-2">
                <select 
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 text-white appearance-none"
                >
                  <option value="" disabled className="text-gray-500">Select a city...</option>
                  {Object.values(citiesData).map(city => (
                    <option key={city.id} value={city.id} className="text-black bg-white">{city.name}, {city.country}</option>
                  ))}
                </select>
                <button type="submit" disabled={!selectedCityId} className="bg-blue-600 p-3 rounded-xl hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  <Plus size={20} />
                </button>
              </form>
            </div>

            {/* Trip Duration Widget */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="text-purple-400" /> Trip Duration
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Number of Days:</span>
                <input 
                  type="number" 
                  min="1" 
                  max="14"
                  value={tripDays}
                  onChange={(e) => setTripDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="bg-black/20 border border-white/10 rounded-xl py-2 px-4 w-24 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Budget Widget */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <DollarSign className={isOverBudget ? "text-red-400" : "text-green-400"} /> Budget Tracker
              </h2>
              <div className="flex items-end justify-between mb-2">
                <span className="text-gray-400">Total Spent</span>
                <span className={`text-2xl font-bold ${isOverBudget ? "text-red-400" : "text-white"}`}>
                  ₹{totalSpent.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden relative">
                <motion.div 
                  className={`h-full ${isOverBudget ? 'bg-red-500' : 'bg-gradient-to-r from-green-400 to-emerald-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Info size={12}/> Auto-calculated
                </p>
                <p className="text-xs text-gray-400">Target: ₹{targetBudget.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Available Activities Pool */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex-grow">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Plus className="text-pink-400" /> Available Activities
              </h2>
              <p className="text-xs text-gray-400 mb-4">Click to add to your itinerary</p>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {availableActivities.length > 0 ? availableActivities.map((activity) => (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => handleAddActivity(activity)}
                      className="bg-black/30 hover:bg-white/10 border border-white/5 p-3 rounded-xl cursor-pointer transition-colors group flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-sm text-white">{activity.name}</p>
                        <p className="text-xs text-blue-400 flex items-center gap-1 mt-1">
                          <MapPin size={10} /> {activity.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">₹{activity.estimatedCost}</p>
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={12} className="text-blue-400" />
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-white/10 rounded-xl">
                      {selectedCities.length === 0 
                        ? "Select a destination first." 
                        : "All activities added to itinerary!"}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>

          {/* Right Column: Itinerary Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl h-full min-h-[600px]">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="text-purple-400" /> Your Itinerary
                </h2>
                <div className="flex gap-2">
                  <button className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition font-medium">
                    Save
                  </button>
                  <button className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition font-medium">
                    Share
                  </button>
                </div>
              </div>

              {itinerary.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                    <Clock size={32} className="text-blue-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No activities yet</h3>
                  <p className="text-gray-400 max-w-sm">
                    Select a destination on the left, then click on available activities to start building your day-by-day plan.
                  </p>
                </div>
              ) : (
                <div className="space-y-10">
                  {Array.from({ length: tripDays }).map((_, dayIndex) => {
                    const currentDay = dayIndex + 1;
                    const dayActivities = itinerary.filter(item => item.day === currentDay);
                    
                    return (
                      <div key={currentDay} className="relative">
                        <div className="absolute left-4 top-10 bottom-0 w-px bg-white/10"></div>
                        
                        <h3 className="text-lg font-bold mb-4 bg-white/10 inline-block px-4 py-1 rounded-full text-blue-300">
                          Day {currentDay}
                        </h3>
                        
                        <div className="space-y-4 ml-10">
                          {dayActivities.length === 0 ? (
                            <p className="text-sm text-gray-500 italic py-2">No activities planned for this day.</p>
                          ) : (
                            <AnimatePresence>
                              {dayActivities.map((item) => (
                                <motion.div 
                                  key={item.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  className="bg-black/30 border border-white/10 p-4 rounded-xl relative group"
                                >
                                  <div className="absolute -left-[45px] top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#0f172a]"></div>
                                  
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-bold text-white text-lg">{item.name}</h4>
                                      <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                        <MapPin size={14} className="text-blue-400" /> {item.city}
                                      </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                      <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                                          ₹{item.estimatedCost.toLocaleString('en-IN')}
                                        </span>
                                        <button 
                                          onClick={() => handleRemoveActivity(item.id)}
                                          className="text-gray-500 hover:text-red-400 transition-colors"
                                          title="Remove Activity"
                                        >
                                          &times;
                                        </button>
                                      </div>
                                      <select 
                                        value={item.day}
                                        onChange={(e) => handleMoveActivity(item.id, e.target.value)}
                                        className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-gray-300 focus:outline-none"
                                      >
                                        {Array.from({ length: tripDays }).map((_, i) => (
                                          <option key={i+1} value={i+1} className="text-black">Move to Day {i+1}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Planner;
