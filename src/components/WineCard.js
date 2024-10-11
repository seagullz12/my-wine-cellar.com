import React from 'react';
import { Link } from 'react-router-dom';
import {
  CardContent,
  CardMedia,
  Typography,
  Box,
} from '@mui/material';
import AgeBadge from '../components/AgeBadge';
import PeakMaturityBadge from '../components/PeakMaturityBadge';
import ForSaleLabel from '../components/ForSaleLabel';
import WineData from '../components/WineData';

export const WineCardDesktop = ({ wine, handleDelete, handleOpen }) => {
  return (
    <Link to={`/cellar/${wine.id}`} style={{ textDecoration: 'none' }}>
        <CardMedia sx={{ position: 'relative' }}>
          {/* The Wine Image */}
          <img
            src={wine.images?.front?.desktop || wine.images?.back?.desktop}
            srcSet={`${wine.images?.front?.mobile || wine.images?.back?.mobile} 600w,
            ${wine.images?.front?.desktop || wine.images?.back?.desktop} 1200w`}
            sizes="(max-width: 600px) 100vw, 1200px"
            alt={wine.name}
            className="wine-image"
            style={{ width: '100%', height: 'auto', borderRadius: '8px' }} // Optional border-radius
          />

          {/* Overlay PeakMaturityBadge on the image */}
          <Box
            sx={{
              position: 'absolute',
              top: 16, // Adjust for vertical position
              left: 16, // Adjust for horizontal position
              borderRadius: '8%', // Make it rounded
            }}
          >
            {!wine.drinkingWindow ? (
              <AgeBadge vintage={wine.vintage} round={true} />
            ) : (
              <PeakMaturityBadge
                vintage={wine.vintage}
                peakMaturity={wine.peakMaturity}
                drinkingWindow={wine.drinkingWindow}
                round={true}
              />
            )}
          </Box>
          <Box
            position="absolute"
            bottom={20} // Adjust this value to position the badge vertically
            right={10} // Adjust this value to position the badge horizontally
            zIndex={1} // Ensure the badge appears above the image
            sx={{ padding: 0 }}
          >
            {wine.status === "for_sale" && <ForSaleLabel price={wine.price} />}
          </Box>
        </CardMedia>
        <Typography variant="body1" sx={{ m: 2, mb: 1 }}><strong>{wine.name}</strong></Typography>
        
        <CardContent sx={{
          padding: 0,
          margin: 1,
          marginBottom: 2
        }}>
          <WineData wine={wine} wineDetailPage={false} showAccordion={false} />
        </CardContent>
    </Link>
  );
};

export const WineCardMobile = ({ wine, handleDelete, handleOpen }) => {
    return (
      <Link to={`/cellar/${wine.id}`} style={{ textDecoration: 'none' }}>
        {/* Column for the Wine Image */}
        <Box sx={{ display: 'flex', flexDirection: 'row', marginBottom: 1.5 }}>
          <Box sx={{ flex: '0 0 45%', position: 'relative' }}>
            <img
              src={wine.images?.front?.desktop || wine.images?.back?.desktop}
              srcSet={`${wine.images?.front?.mobile || wine.images?.back?.mobile} 600w,
                ${wine.images?.front?.desktop || wine.images?.back?.desktop} 1200w`}
              sizes="(max-width: 600px) 100vw, 1200px"
              alt={wine.name}
              className="wine-image"
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }} // Optional border-radius
            />
            {/* Overlay PeakMaturityBadge on the image */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16, // Adjust for vertical position
                left: 16, // Adjust for horizontal position
                borderRadius: '8%', // Make it rounded
              }}
            >
              {!wine.drinkingWindow ? (
                <AgeBadge vintage={wine.vintage} round={true} />
              ) : (
                <PeakMaturityBadge
                  vintage={wine.vintage}
                  peakMaturity={wine.peakMaturity}
                  drinkingWindow={wine.drinkingWindow}
                  round={true}
                />
              )}
            </Box>
            <Box
              position="absolute"
              bottom={20} // Adjust this value to position the badge vertically
              right={10} // Adjust this value to position the badge horizontally
              zIndex={1} // Ensure the badge appears above the image
              sx={{ padding: 0 }}
            >
              {wine.status === "for_sale" && <ForSaleLabel price={wine.price} />}
            </Box>
          </Box>
  
          {/* Column for Wine Details */}
          <Box sx={{ flex: '1 1 auto', paddingLeft: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{wine.name}</strong>
            </Typography>
            {/* Wine Details */}
            <CardContent sx={{ padding: 0, margin: 0 }}>
              <Typography>{wine.grape.join(', ')} | {wine.colour} | {wine.vintage} | {wine.country} | {wine.region} | {wine.classification.join(', ')} | {wine.alcohol} 
              </Typography>
            </CardContent>
          </Box>
        </Box>
      </Link>
    );
  };
  
  export default WineCardMobile;