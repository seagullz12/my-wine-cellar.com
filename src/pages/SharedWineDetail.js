import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import WineMap from '../components/WineMap';
import PeakMaturityBadge from '../components/PeakMaturityBadge';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/swiper-bundle.css'; // Ensure to import Swiper styles

import ReactGA from 'react-ga4';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import WineData from '../components/WineData';

const SharedWineDetail = () => {
  const { token } = useParams();
  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';

  useEffect(() => {
    if (wine) {
      ReactGA.send({
        hitType: 'pageview',
        page: `/cellar/shared-wine-detail`,
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
        setLoading(false);
      }
    };

    fetchWineByToken();
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  const spacingValue = 1; // You can adjust this value to control spacing
  return (
    <Box sx={{ padding: 0, maxWidth: 800, margin: '0 auto' }}>
      {wine ? (
        <Box sx={{ borderRadius: 2, padding: 2 }}>
          <Card sx={{ backgroundColor: '#F5F5F5' }}>
            <Box sx={{ backgroundColor: "#8b3a3a" }}>
              <Typography variant="h4" component="h1" sx={{ padding: 2, textAlign: "center" }}>
                {wine.name}
              </Typography>
            </Box>
            <CardContent sx={{ padding: 0 }}>
              {wine.images && (
                <Box sx={{ backgroundColor: "#8b3a3a" }}>
                  <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={10}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    style={{
                      "--swiper-pagination-color": "#8b3a3a",
                      "--swiper-pagination-bullet-inactive-color": "#fff",
                      "--swiper-pagination-bullet-inactive-opacity": "1",
                      "--swiper-navigation-color": "#fff",
                      height: 'auto', // Ensure the height is set
                    }}
                  >
                    {wine.images.front?.desktop && (
                      <SwiperSlide>
                        <Box position="relative">
                          <img
                            src={wine.images.front.desktop}
                            srcSet={`${wine.images.front.mobile} 600w, ${wine.images.front.desktop} 1200w`}
                            sizes="(max-width: 600px) 100vw, 1200px"
                            alt={`${wine.name} front image`}
                            style={{ width: '100%', borderRadius: '0px' }}
                          />
                          <Box
                            position="absolute"
                            bottom={20}
                            left={10}
                            zIndex={1}
                          >
                            <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} round={false} />
                          </Box>
                        </Box>
                      </SwiperSlide>
                    )}
                    {wine.images.back?.desktop && (
                      <SwiperSlide>
                        <Box position="relative">
                          <img
                            src={wine.images.back.desktop}
                            srcSet={`${wine.images.back.mobile} 600w, ${wine.images.back.desktop} 1200w`}
                            sizes="(max-width: 600px) 100vw, 1200px"
                            alt={`${wine.name} back image`}
                            style={{ width: '100%', borderRadius: '0px' }}
                          />
                          <Box
                            position="absolute"
                            bottom={20}
                            left={10}
                            zIndex={1}
                          >
                            <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} round={false} />
                          </Box>
                        </Box>
                      </SwiperSlide>
                    )}
                  </Swiper>
                </Box>
              )}
              <Box sx={{ padding: 2, margin: 1 }}>
              <WineData wine={wine} wineListPage="true" />
              </Box>
              <Box sx={{ alignItems: "center", margin: 2, padding: 1 }}>
                <WineMap region={wine.region} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Typography color="error">Wine data not found</Typography>
      )}
    </Box>
  );
};

export default SharedWineDetail;
