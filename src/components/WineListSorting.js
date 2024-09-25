import React from 'react';
import ReactGA from 'react-ga4'; // Import GA4
import { Box, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';

const WineListSorting = ({ sortCriteria, sortOrder, onSortChange, onSortOrderChange }) => {
  
  // Handle sort change and log event
  const handleSortChange = (event) => {
    const newSortCriteria = event.target.value;
    
    // Log the sort criteria change event
    ReactGA.event({
      category: 'Sort Engagement',
      action: 'Sort Criteria Changed',
      label: newSortCriteria,
    });

    onSortChange(event); // Call the parent function
  };

  // Handle sort order change and log event
  const handleSortOrderChange = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    
    // Log the sort order change event
    ReactGA.event({
      category: 'Sort Engagement',
      action: 'Sort Order Changed',
      label: newOrder,
    });

    onSortOrderChange(); // Call the parent function
  };

  return (
    <Box display="flex" alignItems="center" marginBottom={2}>
      <FormControl variant="outlined" sx={{ minWidth: 120, marginRight: '10px', boxShadow: 3 }}>
        <InputLabel id="sort-select-label">Sort by</InputLabel>
        <Select
          labelId="sort-select-label"
          value={sortCriteria}
          onChange={handleSortChange} // Use the new handler
          label="Sort by"
        >
          <MenuItem value="vintage">Vintage</MenuItem>
          <MenuItem value="addedDate">Date Added</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="white"
        onClick={handleSortOrderChange} // Use the new handler
        sx={{ boxShadow: 3 }} // Match height of dropdown
      >
        {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
      </Button>
    </Box>
  );
};

export default WineListSorting;
