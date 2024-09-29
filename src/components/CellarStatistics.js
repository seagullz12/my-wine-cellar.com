import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Card, CardContent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const CellarStatistics = ({ wines }) => {
  const [expanded, setExpanded] = useState(false);

  const totalWines = wines.length;

  const coloursCount = wines.reduce((acc, wine) => {
    acc[wine.colour] = (acc[wine.colour] || 0) + 1;
    return acc;
  }, {});

  const grapesCount = wines.reduce((acc, wine) => {
    acc[wine.grape] = (acc[wine.grape] || 0) + 1;
    return acc;
  }, {});

  const vintagesCount = wines.reduce((acc, wine) => {
    acc[wine.vintage] = (acc[wine.vintage] || 0) + 1;
    return acc;
  }, {});

  const countriesCount = wines.reduce((acc, wine) => {
    acc[wine.country] = (acc[wine.country] || 0) + 1;
    return acc;
  }, {});

  const handleChange = () => {
    setExpanded(!expanded);
  };

  return (
    <Accordion expanded={expanded} onChange={handleChange} sx={{ marginBottom: '20px', boxShadow: 3 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
        <Typography variant="body1" component="div">
          My Wine Cellar Summary
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Card variant="outlined" sx={{ width: '100%' }}>
          <CardContent>
            <Typography variant="body1" color="text.primary">
              Total Wines: {totalWines}
            </Typography>

            <Typography variant="body1" component="div" sx={{ marginTop: '10px' }}>
              By Color:
            </Typography>
            {Object.entries(coloursCount).map(([colour, count]) => (
              <Typography key={colour} variant="body2" color="text.secondary">
                {colour}: {count}
              </Typography>
            ))}

            <Typography variant="body1" component="div" sx={{ marginTop: '10px' }}>
              By Country:
            </Typography>
            {Object.entries(countriesCount).map(([country, count]) => (
              <Typography key={country} variant="body2" color="text.secondary">
                {country}: {count}
              </Typography>
            ))}

            {/* <Typography variant="h6" component="div" sx={{ marginTop: '10px' }}>
              By Grape:
            </Typography>
            {Object.entries(grapesCount).map(([grape, count]) => (
              <Typography key={grape} variant="body2" color="text.secondary">
                {grape}: {count}
              </Typography>
            ))} */}

            <Typography variant="body1" component="div" sx={{ marginTop: '10px' }}>
              By Vintage:
            </Typography>
            {Object.entries(vintagesCount).map(([vintage, count]) => (
              <Typography key={vintage} variant="body2" color="text.secondary">
                {vintage}: {count}
              </Typography>
            ))}
          </CardContent>
        </Card>
      </AccordionDetails>
    </Accordion>
  );
};

export default CellarStatistics;
