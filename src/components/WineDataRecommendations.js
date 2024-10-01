import React from 'react';
import { Typography, Grid, Box } from '@mui/material';
import WineBarIcon from '@mui/icons-material/WineBar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const WineDataRecommendations = ({ wine }) => {
  return (
    <Grid container spacing={1}>
      {/* Colour */}
      <Grid item xs={12}>
        <Box display="flex" alignItems="top">
          <WineBarIcon color="primary" sx={{ mr: 2 }} />
         <Typography textAlign="left">
            <strong>Colour:</strong> {wine.colour}
          </Typography>
        </Box>
      </Grid>

      {/* Grape */}
      <Grid item xs={12}>
        <Box display="flex" alignItems="top">
          <WineBarIcon color="primary" sx={{ mr: 2 }} />
         <Typography textAlign="left">
            <strong>Grape:</strong> {wine.grape.join(', ')}
          </Typography>
        </Box>
      </Grid>

      {/* Vintage */}
      <Grid item xs={12}>
        <Box display="flex" alignItems="top">
          <CalendarTodayIcon color="primary" sx={{ mr: 2 }} />
         <Typography textAlign="left">
            <strong>Vintage:</strong> {wine.vintage}
          </Typography>
        </Box>
      </Grid>

      {/* Region */}
      <Grid item xs={12}>
        <Box display="flex" alignItems="top">
          <LocationOnIcon color="primary" sx={{ mr: 2 }} />
         <Typography textAlign="left">
            <strong>Region:</strong> {wine.region}, {wine.country}
          </Typography>
        </Box>
      </Grid>

      {/* Alcohol Content */}
      <Grid item xs={12}>
        <Box display="flex" alignItems="top">
          <LocalDrinkIcon color="primary" sx={{ mr: 2 }} />
         <Typography textAlign="left">
            <strong>Alcohol:</strong> {wine.alcohol}
          </Typography>
        </Box>
      </Grid>
{/*   
      <Grid item xs={12}>
        <Box display="flex" alignItems="top">
          <WineBarIcon color="primary" sx={{ mr: 2 }} />
         <Typography textAlign="left">
            <strong>Nose:</strong> {wine.nose.join(', ')}
          </Typography>
        </Box>
      </Grid>
    
      <Grid item xs={12}>
        <Box display="flex" alignItems="top">
          <RestaurantIcon color="primary" sx={{ mr: 2 }} />
         <Typography textAlign="left">
            <strong>Palate:</strong> {wine.palate.join(', ')}
          </Typography>
        </Box>
      </Grid> */}

      {/* Drinking Window */}
      {/* <Grid item xs={12}>
        <Box display="flex" alignItems="top">
          <AccessTimeIcon color="primary" sx={{ mr: 2 }} />
         <Typography textAlign="left">
            <strong>Drinking Window:</strong> {wine.drinkingWindow.lower} - {wine.drinkingWindow.upper}
          </Typography>
        </Box>
      </Grid> */}

    </Grid>
  );
};

export default WineDataRecommendations;
