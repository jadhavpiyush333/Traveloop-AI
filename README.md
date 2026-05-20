# Traveloop – Personalized Travel Planning Platform

Traveloop is a modern, interactive, and dynamic travel planning web application. It features real-time dynamic data, premium UI/UX, and a scalable MERN stack architecture.

## Project Structure

This project has been modularized into a scalable standard structure:
- `client/`: Frontend (React, Vite, Tailwind CSS, Framer Motion)
- `server/`: Backend (Node.js, Express, MongoDB, Socket.io)

## Setup & Installation

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```
Make sure to create a `.env` file in the `server` directory containing:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Make sure to create a `.env` file in the `client` directory for API keys:
```
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

## Core Features Implemented

1. **Smart Destination Cards (`CityImageCard.jsx`)**: 
   - Uses real dynamic images from Unsplash API (with fallbacks if key missing)
   - Features smooth hover interactions powered by Framer Motion.
   - Glassmorphism UI presenting Top Places, Best Time to Visit, and Cost Estimation.
   - Beautiful, rich aesthetics conforming to modern web app standards.

2. **Real-time Budget Updates**:
   - Integrated Socket.io on the backend (`server/controllers/tripController.js`) to emit live changes when activities are added to a trip.
