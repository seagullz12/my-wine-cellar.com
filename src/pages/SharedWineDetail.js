import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import WineMap from '../components/WineMap'; 
import PeakMaturityBadge from '../components/PeakMaturityBadge';

//swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// ga4 (analytics)
import ReactGA from 'react-ga4';

import 'swiper/swiper-bundle.css'; // Correct Swiper styles import
import '../styles/WineDetail.css'; // Import your custom styles

const SharedWineDetail = () => {
  const { token } = useParams();
  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation(); // ga4 tracking

    const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';
  // const backendURL = 'http://192.168.2.9:8080';
  
  useEffect(() => {
    if (wine) {
      // Use wine's name and other details to provide more context
      ReactGA.send({
        hitType: 'pageview',
        page: `/cellar/shared-wine-detail`,  // You can replace this with a slug or wine-specific identifier
        title: `Shared Wine Detail - ${wine.name} (${wine.vintage})`,
      });
    }
  }, [wine, location]);


  useEffect(() => {
    const fetchWineByToken = async () => {
      try {
        const response = await fetch(`${backendURL}/get-wine-by-token?token=${token}`);
        if (!response.ok) throw new Error('Failed to fetch wine');
    
        const result = await response.json();
        setWine(result.wine);
      } catch (error) {
        console.error('Error fetching wine by token:', error);
        setError('Error fetching wine data');
      } finally {
        setLoading(false); // Stop loading state here
      }
    };    

    fetchWineByToken();
  }, [token, wine]);
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="wine-detail-container">
      <div className="back-link" align="left">
        <Link to="/cellar" className="back-to-wine-list">Back to Your Cellar</Link>
      </div>
      {wine ? (
        <div className="wine-detail-card">
          <div className="wine-detail-header">
            <h1>{wine.name}</h1>
          </div>

          {/* Swiper Carousel for Front and Back Images */}
          {wine.images && (
             <div className="wine-details-image-container">
            <Swiper
            modules={[Navigation, Pagination]} // Pass the modules to the Swiper
            spaceBetween={10}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
          >
            {wine.images.front?.desktop && (
              <SwiperSlide>
                <div className="wine-detail-image">
                  <img
                    src={wine.images.front.desktop}
                    srcSet={`${wine.images.front.mobile} 600w, ${wine.images.front.desktop} 1200w`}
                    sizes="(max-width: 600px) 100vw, 1200px"
                    alt={`${wine.name} front image`}
                    className="wine-detail-image"
                  />
                  <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} round={false} /> 
                </div>
              </SwiperSlide>
            )}
          
            {wine.images.back?.desktop && (
              <SwiperSlide>
                <div className="wine-detail-image">
                  <img
                    src={wine.images.back.desktop}
                    srcSet={`${wine.images.back.mobile} 600w, ${wine.images.back.desktop} 1200w`}
                    sizes="(max-width: 600px) 100vw, 1200px"
                    alt={`${wine.name} back image`}
                    className="wine-detail-image"
                  />
                  <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} round={false} /> 
                </div>
              </SwiperSlide>
            )}
        
          </Swiper>
          </div>
          )}
          <div className="wine-detail-info">
            <p><strong>Grape:</strong> {wine.grape}</p>
            <p><strong>Vintage:</strong> {wine.vintage}</p>
            <p><strong>Region:</strong> {wine.region}</p>
            <p><strong>Producer:</strong> {wine.producer}</p>
            <p><strong>Alcohol Content:</strong> {wine.alcohol}</p>
            <p><strong>Quality Classification:</strong> {wine.classification}</p>
            <p><strong>Colour:</strong> {wine.colour}</p>
            <p><strong>Nose:</strong> {wine.nose}</p>
            <p><strong>Palate:</strong> {wine.palate}</p>
            <p><strong>Pairing:</strong> {wine.pairing}</p>
            <p><strong>Peak Maturity:</strong> {wine.peakMaturity} years after harvest</p>
            {/* Map of Wine Region */}
            <WineMap region={wine.region} />
          </div>
        </div>
      ) : (
        <p>Wine data not found</p>
      )}
    </div>
  );
};

export default SharedWineDetail;
