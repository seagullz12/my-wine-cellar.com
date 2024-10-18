import React from 'react';
import {
  Typography,
  Grid,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WineBarIcon from '@mui/icons-material/WineBar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TerrainIcon from '@mui/icons-material/Terrain';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import StarIcon from '@mui/icons-material/Star';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';

const WineData = ({ wine, wineDetailPage, showAccordion }) => {
  const content = (
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

      {/* Terroir */}
      <Grid item xs={12}>
        <Box display="flex" alignItems="top">
          <TerrainIcon color="primary" sx={{ mr: 2 }} />
          <Typography textAlign="left">
            <strong>Terroir:</strong> {wine.terroir.join(', ')}
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

      {/* Producer */}
      <Grid item xs={12}>
        <Box display="flex" alignItems="top">
          <WineBarIcon color="primary" sx={{ mr: 2 }} />
          <Typography textAlign="left">
            <strong>Producer:</strong> {wine.producer}
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

      {/* Quality Classification */}
      <Grid item xs={12}>
        <Box display="flex" alignItems="top">
          <StarIcon color="primary" sx={{ mr: 2 }} />
          <Typography alignItems="left">
            <strong>Classification:</strong> {wine.classification.join(', ')}
          </Typography>
        </Box>
      </Grid>

      {/* Nose, Palate, Pairing */}
      {wineDetailPage && (
        <>
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
          </Grid>

          {/* Pairing */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="top">
              <RestaurantIcon color="primary" sx={{ mr: 2 }} />
              <Typography textAlign="left">
                <strong>Pairing:</strong> {wine.pairing.join(', ')}
              </Typography>
            </Box>
          </Grid>
        </>
      )}

      {/* Drinking Window */}
      <Grid item xs={12}>
        <Box display="flex" alignItems="top">
          <AccessTimeIcon color="primary" sx={{ mr: 2 }} />
          <Typography textAlign="left">
            <strong>Drink between:</strong> {wine.drinkingWindow.lower} - {wine.drinkingWindow.upper}
          </Typography>
        </Box>
      </Grid>

      {wineDetailPage && (
        <>
          {/* Description */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="top">
              <InfoIcon color="primary" sx={{ mr: 2 }} />
              <Typography textAlign="left">
                <strong>Description:</strong> {wine.description}
              </Typography>
            </Box>
          </Grid>

          {/* Peak Maturity */}
          {wine.peakMaturity && (
            <Grid item xs={12}>
              <Box display="flex" alignItems="top">
                <WineBarIcon color="primary" sx={{ mr: 2 }} />
                <Typography textAlign="left">
                  <strong>Peak Maturity:</strong> {`${wine.peakMaturity} years after harvest`}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Date Added (don't show on add wine page) */}
          {window.document.location.hash !== "#/add-wine" && (
            <Grid item xs={12}>
              <Box display="flex" alignItems="top">
                <AccessTimeIcon color="primary" sx={{ mr: 2 }} />
                <Typography textAlign="left">
                  <i>Date added to Cellar:</i> {wine.dateAdded}
                </Typography>
              </Box>
            </Grid>
          )}
        </>
      )}
    </Grid>
  );

  return (
    <>
      {showAccordion ? (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Wine Details</Typography>
          </AccordionSummary>
          <AccordionDetails >{content}</AccordionDetails>
        </Accordion>
      ) : (
        content
      )}
    </>
  );
};

export default WineData;
