// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import WineList from './components/WineList';
import WineRecommendations from './components/WineRecommendations';
import NavBar from './components/NavBar'; // Import the NavBar component

const App = () => {
  return (
    <Router>
      <div className="App">
        <NavBar /> {/* Include the NavBar */}
        <Routes>
          <Route path="/wine-scanner" element={<Home />} />
          <Route path="/wine-scanner/cellar" element={<WineList />} />
          <Route path="/wine-scanner/personal-sommelier" element={<WineRecommendations />} />
          {/* <Route path="*" element={<NotFound />} />  */}
          {/* Catch-all route */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
