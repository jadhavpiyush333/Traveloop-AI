import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, DollarSign, Plus, Check, Clock, Info, Moon, Coffee, Utensils, Sparkles, Star, Trash2, FileText, Download, Share2, Presentation } from 'lucide-react';
import { fetchCityImage, fetchMultiPhoto } from '../services/imageService';
import { citiesData } from '../data/citiesData';
import { exportToPDF, exportToWord, exportToPPT } from '../utils/exportUtils';

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
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  // When selected cities change, calculate dynamic target budget based on average min cost
  useEffect(() => {
    if (itinerary.length === 0) { // Only auto-calculate if no itinerary yet
      let newTarget = 0;
      selectedCities.forEach(city => {
        const costStr = city.cost.split('–')[0].replace(/[^0-9]/g, '');
        if (costStr) {
          newTarget += parseInt(costStr, 10);
        }
      });
      setTargetBudget(newTarget || 50000);
    }
  }, [selectedCities]);

  // Load existing trip if ID is in URL (simplified for now)
  useEffect(() => {
    const tripId = searchParams.get('id');
    if (tripId) {
      // Mock fetch
      // const loadTrip = async () => { ... }
    }
  }, [searchParams]);

  const saveTrip = async () => {
    // Logic to save to /api/trips
    console.log("Saving trip...", { selectedCities, itinerary, targetBudget, totalSpent });
    alert("Trip saved successfully! (Simulated)");
  };

  // Derived available activities based on selected cities
  const allGeneratedActivities = [];
  selectedCities.forEach(city => {
    // Helper to get cost multiplier based on city's budget
    const getCostMultiplier = (cityCostStr) => {
      const baseValue = parseInt(cityCostStr.split('–')[0].replace(/[^0-9]/g, ''), 10) || 50000;
      return Math.max(0.5, baseValue / 40000); // Normalize: NYC ≈ 3.7x, London ≈ 3x, Pune ≈ 0.4x
    };

    const multiplier = getCostMultiplier(city.cost);

    // 1. Add real places from citiesData
    city.places.forEach(place => {
      allGeneratedActivities.push({
        id: `${city.id}-${place.replace(/\s+/g, '-').toLowerCase()}`,
        name: place,
        city: city.name,
        // Scale cost based on city premium level (Higher base for premium cities)
        estimatedCost: Math.floor((Math.random() * 4000 + 3000) * multiplier)
      });
    });

    // 2. Generate dynamic filler activities
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
        estimatedCost: Math.floor((Math.random() * 2000 + 1500) * multiplier)
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

  const handleAIPlan = () => {
    if (itinerary.length === 0) {
      alert("Please add some activities first!");
      return;
    }

    const newItinerary = [];
    const itemsPerDay = Math.ceil(itinerary.length / tripDays);
    
    // BUG FIX: Filter out previously generated AI blocks to avoid duplicates
    const realActivities = itinerary.filter(item => !item.id.toString().startsWith('ai-'));
    
    if (realActivities.length === 0) {
      alert("Please add some real activities first!");
      return;
    }

    const sortedOriginal = [...realActivities].sort((a, b) => a.city.localeCompare(b.city));

    const mealTemplates = {
      'Breakfast': ['Cafe', 'Bistro', 'Bakery', 'Breakfast Club'],
      'Lunch': ['Kitchen', 'Grill', 'Deli', 'Trattoria'],
      'Dinner': ['Premium Restaurant', 'Sky Lounge', 'Steakhouse', 'Fine Dining']
    };

    for (let day = 1; day <= tripDays; day++) {
      const currentCityName = selectedCities[0]?.name || "Destination";
      
      // 1. Morning Slot: Breakfast + First Attraction
      const morningAttraction = sortedOriginal.shift();
      if (morningAttraction) {
        newItinerary.push({
          ...morningAttraction,
          day,
          slot: 'Morning',
          mealType: 'Breakfast',
          restaurant: `${morningAttraction.name} ${mealTemplates['Breakfast'][Math.floor(Math.random() * 4)]}`,
          estimatedCost: morningAttraction.estimatedCost + 800
        });
      }

      // 2. Afternoon Slot: Lunch + Second Attraction (if exists)
      const afternoonAttraction = sortedOriginal.shift();
      if (afternoonAttraction) {
        newItinerary.push({
          ...afternoonAttraction,
          day,
          slot: 'Afternoon',
          mealType: 'Lunch',
          restaurant: `${afternoonAttraction.city} ${mealTemplates['Lunch'][Math.floor(Math.random() * 4)]}`,
          estimatedCost: afternoonAttraction.estimatedCost + 1500
        });
      }

      // 3. Evening Slot: Night Activity + Dinner
      const nightOptions = [
        "Premium Rooftop Bar Experience", "Guided Night Food Tour", 
        "VIP Lounge Experience", "Fine Dining Dinner", 
        "Private City Night Drive", "Jazz Club & Cocktails"
      ];
      const randomNight = nightOptions[Math.floor(Math.random() * nightOptions.length)];
      
      newItinerary.push({
        id: `ai-night-${day}-${Date.now()}`,
        name: randomNight,
        city: currentCityName,
        day,
        slot: 'Evening',
        mealType: 'Dinner',
        restaurant: `${currentCityName} ${mealTemplates['Dinner'][Math.floor(Math.random() * 4)]}`,
        estimatedCost: 5500,
        category: 'Night'
      });
    }

    // Capture any remaining activities that didn't fit in the 2-per-day slot
    let index = 0;
    while (sortedOriginal.length > 0) {
      const act = sortedOriginal.shift();
      const targetDay = (index % tripDays) + 1;
      newItinerary.push({
        ...act,
        day: targetDay,
        slot: 'Extra',
        mealType: 'Snack',
        restaurant: `${act.city} Refreshments`
      });
      index++;
    }

    setItinerary(newItinerary);
    setTotalSpent(newItinerary.reduce((sum, item) => sum + (item.estimatedCost || 0), 0));
  };

  const handleClearItinerary = () => {
    if (window.confirm("Are you sure you want to clear your entire itinerary and selected cities?")) {
      setItinerary([]);
      setSelectedCities([]);
      setTotalSpent(0);
      setTargetBudget(50000); // Reset to default
    }
  };

  const handleShareTrip = async () => {
    if (itinerary.length === 0) {
      alert("Add some activities to your itinerary before sharing!");
      return;
    }

    const cities = selectedCities.map(c => c.name).join(', ');
    
    let activityList = "";
    Array.from({ length: tripDays }).forEach((_, i) => {
      const day = i + 1;
      const dayActivities = itinerary.filter(item => item.day === day);
      if (dayActivities.length > 0) {
        activityList += `\n📅 Day ${day}:\n`;
        dayActivities.forEach(act => {
          activityList += `- ${act.name}: ₹${act.estimatedCost.toLocaleString('en-IN')}\n`;
        });
      }
    });

    const shareText = `Check out my ${tripDays}-day trip to ${cities} planned on Traveloop!\n` +
      `Total Activities: ${itinerary.length}\n` +
      `Estimated Budget: ₹${totalSpent.toLocaleString('en-IN')}\n` +
      `${activityList}\n` +
      `Join me on my next adventure!`;

    const shareData = {
      title: 'My Traveloop Trip',
      text: shareText,
      url: window.location.href // In a real app, this would be a unique link to the saved trip
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
        alert("Trip summary copied to clipboard! You can now paste and share it.");
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleExport = async (type) => {
    if (itinerary.length === 0) return alert("Add some activities to your itinerary first!");
    
    setIsExporting(true);
    setExportProgress('Fetching place imagery...');

    try {
      const cityImages = {};
      for (const city of selectedCities) {
        cityImages[city.name] = await fetchMultiPhoto(city.imageQuery || city.name, 3);
      }
      
      const activityImages = {};
      let count = 0;
      for (const act of itinerary) {
        count++;
        // Reduced counts to stay within API limits and preserve memory
        setExportProgress(`Fetching visuals for ${act.name}...`);
        activityImages[act.id] = await fetchMultiPhoto(act.name + " " + (act.city || selectedCities[0]?.name), 3);
        
        if (act.restaurant) {
          setExportProgress(`Curating dining visuals for ${act.restaurant}...`);
          activityImages[act.id + "-res"] = await fetchMultiPhoto(act.restaurant + " " + (act.city || selectedCities[0]?.name), 1);
        }
      }

      setExportProgress(`Designing ${type.toUpperCase()} Portfolio...`);
      
      try {
        if (type === 'pdf') await exportToPDF(itinerary, tripDays, selectedCities, totalSpent, cityImages, activityImages);
        if (type === 'word') await exportToWord(itinerary, tripDays, selectedCities, totalSpent, cityImages, activityImages);
        if (type === 'ppt') await exportToPPT(itinerary, tripDays, selectedCities, totalSpent, cityImages, activityImages);
      } catch (genErr) {
        console.error(`${type.toUpperCase()} Generation Error:`, genErr);
        throw new Error(`Failed to generate ${type.toUpperCase()}. The file might be too large.`);
      }
      
    } catch (err) {
      console.error('Export failed sequence:', err);
      alert(`Export Failed: ${err.message || 'API limit reached or network error'}`);
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  const handlePrintPDF = () => {
    window.print();
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <DollarSign className={isOverBudget ? "text-red-400" : "text-green-400"} /> Budget Tracker
                </h2>
                <button 
                  onClick={() => setIsEditingBudget(!isEditingBudget)}
                  className="text-xs text-blue-400 hover:underline"
                >
                  {isEditingBudget ? "Done" : "Edit Target"}
                </button>
              </div>
              
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
                  <Info size={12}/> {isEditingBudget ? "Manual entry" : "Auto-calculated"}
                </p>
                {isEditingBudget ? (
                  <input 
                    type="number"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(parseInt(e.target.value) || 0)}
                    className="bg-black/40 border border-white/20 rounded px-2 py-0.5 text-xs text-white max-w-[80px]"
                  />
                ) : (
                  <p className="text-xs text-gray-400">Target: ₹{targetBudget.toLocaleString('en-IN')}</p>
                )}
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
          <div className="lg:col-span-2 md:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl h-full min-h-[600px]">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Calendar className="text-purple-400" /> Your Itinerary
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">{itinerary.length} items planned across {tripDays} days</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleClearItinerary}
                    className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition border border-red-500/20"
                    title="Clear All"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    onClick={handleAIPlan}
                    className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 rounded-xl transition font-bold text-white shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"
                  >
                    <span className="relative flex items-center gap-2 z-10">
                      <Sparkles size={18} />
                      AI Arrange
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                  </button>
                  
                  {/* Premium Export Button Group */}
                  <div className="flex flex-wrap items-center bg-white/5 p-1 rounded-xl border border-white/10 ml-2 gap-1 sm:gap-0">
                    <button 
                      onClick={() => handleExport('pdf')}
                      disabled={isExporting}
                      className="p-2.5 hover:bg-white/10 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                      title="Professional PDF"
                    >
                      <Download size={18} className="text-red-400" />
                    </button>
                    <div className="w-px h-6 bg-white/10"></div>
                    <button 
                      onClick={() => handleExport('word')}
                      disabled={isExporting}
                      className="p-2.5 hover:bg-white/10 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                      title="MS Word (.docx)"
                    >
                      <FileText size={18} className="text-blue-400" />
                    </button>
                    <div className="w-px h-6 bg-white/10"></div>
                    <button 
                      onClick={() => handleExport('ppt')}
                      disabled={isExporting}
                      className="p-2.5 hover:bg-white/10 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                      title="Premium Presentation"
                    >
                      <Presentation size={18} className="text-amber-400" />
                    </button>
                  </div>

                  <button 
                    onClick={handleShareTrip}
                    className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-lg shadow-blue-500/20"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Progress Overlay for Exports */}
              <AnimatePresence>
                {isExporting && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center"
                  >
                    <div className="bg-white/10 border border-white/20 p-8 rounded-3xl max-w-sm w-full text-center">
                      <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Generating Report</h3>
                      <p className="text-gray-400 text-sm">{exportProgress}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                                  className="bg-black/30 border border-white/10 p-4 md:p-6 rounded-xl relative group"
                                >
                                  <div className="absolute -left-[45px] top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#0f172a]"></div>
                                  
                                  <div className="flex justify-between items-start">
                                    <div className="flex gap-4 items-start">
                                      <div className={`p-2 rounded-lg ${
                                        item.category === 'Night' ? 'bg-purple-500/20 text-purple-400' :
                                        item.category === 'Rest' ? 'bg-orange-500/20 text-orange-400' :
                                        'bg-blue-500/10 text-blue-400'
                                      }`}>
                                        {item.category === 'Food' ? <Utensils size={20} /> : 
                                         item.category === 'Adventure' ? <Star size={20} /> :
                                         item.category === 'Night' ? <Moon size={20} /> :
                                         item.category === 'Rest' ? <Coffee size={20} /> :
                                         <MapPin size={20} />}
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-white text-lg">{item.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                          <p className="text-sm text-gray-400 flex items-center gap-1">
                                            <MapPin size={14} className="text-blue-400" /> {item.city}
                                          </p>
                                          <span className="text-[10px] uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-gray-500 border border-white/5">
                                            {item.category || 'Sightseeing'}
                                          </span>
                                        </div>
                                      </div>
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
