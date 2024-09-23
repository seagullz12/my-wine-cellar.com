import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, FormControlLabel, Checkbox, FormGroup, Typography, Button, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const WineListFilters = ({ filters, onFilterChange, onResetFilters }) => {
  // Initialize filters as empty arrays
  const [selectedFilters, setSelectedFilters] = useState({
    colour: [],
    grape: [],
    vintage: [],
    status: [],
  });

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prevFilters => {
      const filterSet = new Set(prevFilters[filterType]);

      // Add or remove the filter value from the set
      if (filterSet.has(value)) {
        filterSet.delete(value);
      } else {
        filterSet.add(value);
      }

      const newFilters = {
        ...prevFilters,
        [filterType]: Array.from(filterSet),
      };

      onFilterChange(newFilters); // Notify parent component of filter change
      return newFilters;
    });
  };

  const handleResetFilters = () => {
    // Reset selected filters to empty arrays
    setSelectedFilters({
      colour: [],
      grape: [],
      vintage: [],
      status: [],
    });
    onResetFilters(); // Notify parent to reset filters
  };

  return (
    <Accordion defaultExpanded={false} 
               sx={{ marginBottom: '20px' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="filter-content"
        id="filter-header"
      >
        <Typography variant="h6">Filter Wines</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Box sx={{ padding: '20px' }}>
          <FormGroup>
            {/* colour Filters */}
            <Typography variant="subtitle1">Colour</Typography>
            {filters.colours.map(colour => (
              <FormControlLabel
                key={colour}
                control={
                  <Checkbox
                    checked={selectedFilters.colour.includes(colour)} // No filter is selected initially
                    onChange={() => handleFilterChange('colour', colour)}
                  />
                }
                label={colour}
              />
            ))}

            {/* Grape Filters */}
            <Typography variant="subtitle1">Grape</Typography>
            {filters.grapes.map(grape => (
              <FormControlLabel
                key={grape}
                control={
                  <Checkbox
                    checked={selectedFilters.grape.includes(grape)} // No filter is selected initially
                    onChange={() => handleFilterChange('grape', grape)}
                  />
                }
                label={grape}
              />
            ))}

            {/* Vintage Filters */}
            <Typography variant="subtitle1">Vintage</Typography>
            {filters.vintages.map(vintage => (
              <FormControlLabel
                key={vintage}
                control={
                  <Checkbox
                    checked={selectedFilters.vintage.includes(vintage)} // No filter is selected initially
                    onChange={() => handleFilterChange('vintage', vintage)}
                  />
                }
                label={vintage}
              />
            ))}

            {/* Status Filters */}
            <Typography variant="subtitle1">Status</Typography>
            {filters.statuses.map(status => (
              <FormControlLabel
                key={status}
                control={
                  <Checkbox
                    checked={selectedFilters.status.includes(status)} // No filter is selected initially
                    onChange={() => handleFilterChange('status', status)}
                  />
                }
                label={status}
              />
            ))}
          </FormGroup>

          {/* Reset Filters Button */}
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleResetFilters} 
            sx={{ marginTop: '10px' }}
          >
            Reset Filters
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default WineListFilters;
