import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavigationBar from './components/NavigationBar.jsx';
import Web3Provider from './components/Web3Context.js';
import HomePage from "./pages/HomePage.jsx";
import TestPage from './pages/TestPage.jsx';
import ArtistDashboardPage from './pages/ArtistDashboardPage.jsx';
import BuyerDashboardPage from './pages/BuyerDashboardPage.jsx';
import SongDetailsPage from "./pages/SongDetailsPage.jsx";
import WelcomePage from './pages/WelcomePage.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './theme.css';  // <-- make sure theme is globally loaded

function App() {
  return (
    <Web3Provider>
      <Router>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/artistdashboard" element={<ArtistDashboardPage />} />
          <Route path="/buyerdashboard" element={<BuyerDashboardPage />} />
          <Route path="/songs/:id" element={<SongDetailsPage />} />
          <Route path="/test" element={<TestPage />} />
        </Routes>
      </Router>
    </Web3Provider>
  );
}

export default App;
