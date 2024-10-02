import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useParams, useLocation } from 'react-router-dom';
import WineData from '../components/WineData'; 
import PeakMaturityBadge from '../components/PeakMaturityBadge';
import AgeBadge from '../components/AgeBadge';
import { getWineIdFromToken } from '../components/utils/getWineIdFromToken';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import ForSaleLabel from '../components/ForSaleLabel'; 
import 'swiper/swiper-bundle.css'; 
import {
    Box,
    Typography,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    useMediaQuery,
    useTheme
} from '@mui/material';
import WineMap from '../components/WineMap';
import ReactGA from 'react-ga4';

const SharedWineDetail = () => {
  const { id: wineId, token } = useParams();
  const [user, setUser] = useState(null);
  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
      });
      return () => unsubscribe();
  }, []);

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
      const fetchWineData = async () => {
          const resolvedWineId = token ? await getWineIdFromToken(token) : wineId;

          if (user && resolvedWineId) {
              try {
                  const authToken = await user.getIdToken();
                  const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-wine-data?id=${resolvedWineId}`, {
                      headers: {
                          'Authorization': `Bearer ${authToken}`,
                      },
                  });

                  if (response.ok) {
                      const result = await response.json();
                      setWine(result.wine);
                  } else {
                      setError('Error fetching wine data');
                  }
              } catch (error) {
                  setError('An error occurred while fetching wine data');
              } finally {
                  setLoading(false);
              }
          } else {
              setLoading(false);
          }
      };

      fetchWineData();
  }, [wineId, user, token]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
      <Box sx={{ padding: 0, maxWidth: 1200, margin: '0 auto' }}>

          {wine ? (
              <>
                  <Typography variant="h4" component="h1" color="text.primary" sx={{ textAlign: 'left', m: 2 }}>
                      {wine.name} ({wine.vintage})
                  </Typography>

                  {isMobile ? (
                      // Mobile Layout
                      <Grid container spacing={2}>
                          <Grid item xs={12}>
                              {/* <Card sx={{ backgroundColor: '#F5F5F5', 
                                          padding: 0, 
                                          borderRadius:0, 
                                          margin:1,
                                          marginBottom:0,
                                          boxShadow:0
                                          }}> */}
                              <CardContent sx={{ p: 2 }}>
                                  {wine.images && (
                                      <Box sx={{ position: 'relative' }}>
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
                                              }}
                                          >
                                              {wine.images.front?.mobile && (
                                                  <SwiperSlide>
                                                      <img
                                                          src={wine.images.front.mobile}
                                                          alt={`${wine.name} front image`}
                                                          style={{ width: '100%', borderRadius: '0px', display: 'block' }}
                                                      />
                                                      <Box
                                                          position="absolute"
                                                          bottom={20} // Adjust this value to position the badge vertically
                                                          left={10} // Adjust this value to position the badge horizontally
                                                          zIndex={1} // Ensure the badge appears above the image
                                                          sx={{ padding: 0 }}
                                                      >
                                                          {!wine.drinkingWindow ? (
                                                              <AgeBadge vintage={wine.vintage} round={true} />
                                                          ) : (
                                                              <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} drinkingWindow={wine.drinkingWindow} round={true} />
                                                          )}
                                                      </Box>
                                                      <Box
                                                          position="absolute"
                                                          bottom={20} // Adjust this value to position the badge vertically
                                                          right={10} // Adjust this value to position the badge horizontally
                                                          zIndex={1} // Ensure the badge appears above the image
                                                          sx={{ padding: 0 }}>
                                                          {wine.status==="for_sale" &&( <ForSaleLabel price={wine.price} /> )}
                                                      </Box>
                                                  </SwiperSlide>
                                              )}
                                              {wine.images.back?.mobile && (
                                                  <SwiperSlide>
                                                      <img
                                                          src={wine.images.back.mobile}
                                                          alt={`${wine.name} back image`}
                                                          style={{ width: '100%', borderRadius: '0px', display: 'block' }}
                                                      />
                                                      <Box
                                                          position="absolute"
                                                          bottom={20} // Adjust this value to position the badge vertically
                                                          left={10} // Adjust this value to position the badge horizontally
                                                          zIndex={1} // Ensure the badge appears above the image
                                                          sx={{ padding: 0 }}
                                                      >
                                                          {!wine.drinkingWindow ? (
                                                              <AgeBadge vintage={wine.vintage} round={true} />
                                                          ) : (
                                                              <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} drinkingWindow={wine.drinkingWindow} round={true} />
                                                          )}
                                                      </Box>
                                                      <Box
                                                          position="absolute"
                                                          bottom={20} // Adjust this value to position the badge vertically
                                                          right={10} // Adjust this value to position the badge horizontally
                                                          zIndex={1} // Ensure the badge appears above the image
                                                          sx={{ padding: 0 }}>
                                                          {wine.status==="for_sale" &&( <ForSaleLabel price={wine.price} /> )}
                                                      </Box>
                                                  </SwiperSlide>
                                              )}
                                          </Swiper>
                                      </Box>
                                  )}
                              </CardContent>
                              {/* </Card> */}
                          </Grid>

                          <Grid item xs={12} >
                              <Box sx={{
                                  padding: 2
                              }}>
                                      <Card>
                                          <CardContent sx={{ p: 2 }}>
                                              <WineData wine={wine} wineDetailPage={true}/>
                                          </CardContent>
                                      </Card>
                              </Box>
                          </Grid>
                      </Grid>
                  ) : (
                      // Desktop Layout
                      <Grid container spacing={2}>
                          <Grid item xs={12} md={4} >
                              {/* <Card> */}
                              <CardContent sx={{ m: 0, p: 0 }}>
                                  {wine.images && (
                                      <Box sx={{ position: 'relative' }}>
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
                                                  "--swiper-navigation-color": "#fff"
                                              }}
                                          >
                                              {wine.images.front?.desktop && (
                                                  <SwiperSlide>
                                                      <img
                                                          src={wine.images.front.desktop}
                                                          alt={`${wine.name} front image`}
                                                          style={{ width: '100%', borderRadius: '0px', display: 'block' }}
                                                      />
                                                      <Box
                                                          position="absolute"
                                                          bottom={20} // Adjust this value to position the badge vertically
                                                          left={10} // Adjust this value to position the badge horizontally
                                                          zIndex={1} // Ensure the badge appears above the image
                                                          sx={{ padding: 0 }}
                                                      >
                                                          {!wine.drinkingWindow ? (
                                                              <AgeBadge vintage={wine.vintage} round={true} />
                                                          ) : (
                                                              <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} drinkingWindow={wine.drinkingWindow} round={true} />
                                                          )}
                                                      </Box>
                                                      <Box
                                                          position="absolute"
                                                          bottom={20} // Adjust this value to position the badge vertically
                                                          right={10} // Adjust this value to position the badge horizontally
                                                          zIndex={1} // Ensure the badge appears above the image
                                                          sx={{ padding: 0 }}>
                                                          {wine.status==="for_sale" &&( <ForSaleLabel price={wine.price} /> )}
                                                      </Box>
                                                  </SwiperSlide>

                                              )}
                                              {wine.images.back?.desktop && (
                                                  <SwiperSlide>
                                                      <img
                                                          src={wine.images.back.desktop}
                                                          alt={`${wine.name} back image`}
                                                          style={{ width: '100%', borderRadius: '0px', display: 'block' }}
                                                      />
                                                      <Box
                                                          position="absolute"
                                                          bottom={20} // Adjust this value to position the badge vertically
                                                          left={10} // Adjust this value to position the badge horizontally
                                                          zIndex={1} // Ensure the badge appears above the image
                                                          sx={{ padding: 0 }}
                                                      >
                                                          {!wine.drinkingWindow ? (
                                                              <AgeBadge vintage={wine.vintage} round={true} />
                                                          ) : (
                                                              <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} drinkingWindow={wine.drinkingWindow} round={true} />
                                                          )}
                                                      </Box>
                                                      <Box
                                                          position="absolute"
                                                          bottom={20} // Adjust this value to position the badge vertically
                                                          right={10} // Adjust this value to position the badge horizontally
                                                          zIndex={1} // Ensure the badge appears above the image
                                                          sx={{ padding: 0 }}>
                                                          {wine.status==="for_sale" &&( <ForSaleLabel price={wine.price} /> )}
                                                      </Box>
                                                  </SwiperSlide>
                                              )}
                                          </Swiper>
                                      </Box>
                                  )}
                              </CardContent>
                              {/* </Card> */}
                          </Grid>

                          <Grid item xs={12} md={8}>
                              <Box>
                                      <Card>
                                          <CardContent sx={{ p: 2 }}>
                                              <WineData wine={wine} wineDetailPage={true} />
                                          </CardContent>
                                      </Card>
                              </Box>
                          </Grid>
                      </Grid>
                  )}
              </>
          ) : (
              <Typography variant="h5">No wine details found.</Typography>
          )}

          {/* {wine && (
          <Box sx={{ alignItems: "center", marginTop: 2, padding: 1 }}>
              <WineMap region={wine.region} />
          </Box>
          )} */}
      </Box>
  );
};

export default SharedWineDetail;
