// src/components/WineListSorting.js

import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';

const WineListSorting = ({ sortCriteria, sortOrder, onSortChange, onSortOrderChange }) => {
  return (
    <Box display="flex" alignItems="center" marginBottom={2}>
     <FormControl variant="outlined" sx={{ minWidth: 120, marginRight: '10px'}}>
        <InputLabel id="sort-select-label">Sort by</InputLabel>
        <Select
          labelId="sort-select-label"
          value={sortCriteria}
          onChange={onSortChange}
          label="Sort by"
        >
          <MenuItem value="vintage">Vintage</MenuItem>
          <MenuItem value="addedDate">Date Added</MenuItem>
        </Select>
      </FormControl>
      <Button variant="contained" 
              color= "white" 
              onClick={onSortOrderChange}
              sx={{ height: '56px'}} // Match height of dropdown
              >
        {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
      </Button>
    </Box>
  );
};

export default WineListSorting;
