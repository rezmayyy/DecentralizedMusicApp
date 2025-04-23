import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavigationBar from './components/NavigationBar.jsx';
import Web3Provider from './components/Web3Context.js';
import HomePage from './pages/HomePage.jsx';
import ArtistDashboardPage from './pages/ArtistDashboardPage.jsx';
import TestPage from './pages/TestPage.jsx';
import BuyerDashboardPage from './pages/BuyerDashboardPage.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Web3Provider>
      <Router>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/artistdashboard" element={<ArtistDashboardPage />} />
          <Route path="/buyerdashboard" element={<BuyerDashboardPage />} />
        </Routes>
      </Router>
    </Web3Provider>
  )
}

export default App;
