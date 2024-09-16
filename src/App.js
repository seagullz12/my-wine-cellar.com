// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import WineList from './components/WineList';
import NavBar from './components/NavBar'; // Import the NavBar component

const App = () => {
  return (
    <Router>
      <div className="App">
        <NavBar /> {/* Include the NavBar */}
        <Routes>
          <Route path="/wine-scanner" element={<Home />} />
          <Route path="/wine-scanner/cellar" element={<WineList />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
