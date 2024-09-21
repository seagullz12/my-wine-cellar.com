import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/WineMap.css'; 

const WineMap = ({ region }) => {
  const [regionCoordinates, setRegionCoordinates] = useState(null);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const geocodingAPIKey = process.env.REACT_APP_GEOCODING_API_KEY; 
  const geocodingAPIUrl = 'https://api.opencagedata.com/geocode/v1/json';

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (region) {
        try {
          const response = await axios.get(geocodingAPIUrl, {
            params: {
              q: region,
              key: geocodingAPIKey,
            },
          });

          if (response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry;
            setRegionCoordinates([lat, lng]);
          } else {
            setError('Coordinates not found for this region');
          }
        } catch (err) {
          setError('An error occurred while fetching coordinates');
        }
      }
    };

    fetchCoordinates();
  }, [region, geocodingAPIKey]); // Include geocodingAPIKey here

  // Lazy loading using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing after the first intersection
        }
      });
    });

    const mapElement = document.querySelector('.wine-map');
    if (mapElement) {
      observer.observe(mapElement);
    }

    return () => {
      if (mapElement) {
        observer.unobserve(mapElement);
      }
    };
  }, []);

  if (error) return <p className="wine-detail-error">{error}</p>;

  return (
    <div className="wine-map">
      {isVisible && regionCoordinates ? (
        <iframe
          width="100%"
          height="300"
          frameBorder="0"
          scrolling="no"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${regionCoordinates[1] - 0.1},${regionCoordinates[0] - 0.1},${regionCoordinates[1] + 0.1},${regionCoordinates[0] + 0.1}&layer=mapnik&marker=${regionCoordinates[0]},${regionCoordinates[1]}`}
          title="Wine Region Map"
        />
      ) : (
        <p>Loading map...</p>
      )}
    </div>
  );
};

export default WineMap;
