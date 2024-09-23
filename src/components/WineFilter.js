import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

const WineFilter = ({ filter, onFilterChange }) => {
  return (
    <Box sx={{ width: '100%', textAlign: 'center', mb: 4 }}> {/* Center the filter */}
      <FormControl variant="outlined" sx={{ minWidth: 200 }}> {/* Adjust width */}
        <InputLabel id="wine-status-filter-label">Filter your wines</InputLabel>
        <Select
          labelId="wine-status-filter-label"
          id="wine-status-filter"
          value={filter}
          onChange={onFilterChange}
          label="Filter by Status"
        >
          <MenuItem value="">All wines</MenuItem>
          <MenuItem value="in_inventory">Wines in Cellar</MenuItem>
          <MenuItem value="consumed">Consumed wines</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default WineFilter;
