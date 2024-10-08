import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Typography,
  Button,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  OutlinedInput,
  Tooltip,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import ReactGA from 'react-ga4'; // Import GA4

const WineListFilters = ({ filters, onFilterChange, onResetFilters }) => {
  const [selectedFilters, setSelectedFilters] = useState({
    colour: [],
    grape: [],
    vintage: [],
    status: [],
    maturityStatus: [],
    dateAdded: [],
    country: [],
  });

  // Handle filter change when checkbox or dropdown is used
  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prevFilters => {
      const filterSet = new Set(prevFilters[filterType]);

      if (Array.isArray(value)) {
        // Handle multi-select for grape dropdown
        const newFilters = {
          ...prevFilters,
          [filterType]: value,
        };

        // Log the filter engagement event for dropdown
        ReactGA.event({
          category: 'Filter Engagement',
          action: 'Grape Filter Selected',
          label: value.join(', ') || 'All',
        });

        onFilterChange(newFilters);
        return newFilters;
      } else {
        // Handle checkbox selection
        if (filterSet.has(value)) {
          filterSet.delete(value);
        } else {
          filterSet.add(value);
        }

        const newFilters = {
          ...prevFilters,
          [filterType]: Array.from(filterSet),
        };

        // Log the filter engagement event for checkboxes
        ReactGA.event({
          category: 'Filter Engagement',
          action: 'Checkbox Filter Selected',
          label: `${filterType} - ${value}`,
        });

        onFilterChange(newFilters); // Notify parent of filter change
        return newFilters;
      }
    });
  };

  // Handle deleting a filter directly from the Chips
  const handleDeleteFilter = (filterType, value) => {
    setSelectedFilters(prevFilters => {
      const updatedFilters = prevFilters[filterType].filter(item => item !== value); // Remove the specific filter value
      const newFilters = {
        ...prevFilters,
        [filterType]: updatedFilters,
      };

      onFilterChange(newFilters); // Notify parent with updated filters

      // Log the filter removal event
      ReactGA.event({
        category: 'Filter Engagement',
        action: 'Filter Removed',
        label: `${filterType} - ${value}`,
      });

      return newFilters;
    });
  };

  // Reset all filters to their default state
  const handleResetFilters = () => {
    const resetFilters = {
      colour: [],
      grape: [],
      vintage: [],
      dateAdded: [],
      country: [],
      maturityStatus: [],
      status: [],
    };
    setSelectedFilters(resetFilters);
    onResetFilters(); // Notify parent to reset filters

    // Log the reset filters event
    ReactGA.event({
      category: 'Filter Engagement',
      action: 'Filters Reset',
      label: 'All filters reset',
    });
  };

  const handleClearFilterSection = (filterType) => {
    handleFilterChange(filterType, []);
  };

  return (
    <Accordion defaultExpanded={false} sx={{ marginBottom: '20px', boxShadow: 3}}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="filter-content"
        id="filter-header"
      >
        <Typography variant="body1">Filter Wines</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Box sx={{ padding: '20px' }}>
          <FormGroup>
            {/* Colour Filters */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1">Colour</Typography>
              <Tooltip title="Clear Colour Filters">
                <IconButton size="small" onClick={() => handleClearFilterSection('colour')}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
            {filters.colours.map(colour => (
              <FormControlLabel
                key={colour}
                control={
                  <Checkbox
                    checked={selectedFilters.colour.includes(colour)}
                    onChange={() => handleFilterChange('colour', colour)}
                  />
                }
                label={colour}
              />
            ))}

            {/* Display selected colour filters as Chips */}
            {selectedFilters.colour.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginBottom: '10px' }}>
                {selectedFilters.colour.map(colour => (
                  <Chip
                    key={colour}
                    label={colour}
                    onDelete={() => handleDeleteFilter('colour', colour)} // Remove when "X" is clicked
                  />
                ))}
              </Box>
            )}

            {/* Grape Filters - Searchable Dropdown */}
            <FormControl fullWidth sx={{ marginTop: '20px' }}>
              <InputLabel id="grape-select-label">Grape</InputLabel>
              <Select
                labelId="grape-select-label"
                id="grape-select"
                multiple
                value={selectedFilters.grape}
                onChange={(e) => handleFilterChange('grape', e.target.value)}
                input={<OutlinedInput label="Grape" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        onDelete={() => handleDeleteFilter('grape', value)} // Remove grape when "X" clicked
                      />
                    ))}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 224,
                    },
                  },
                }}
              >
                <MenuItem value="select-all" onClick={() => handleClearFilterSection('grape')}>
                  <em>Clear All</em>
                </MenuItem>
                {filters.grapes.map(grape => (
                  <MenuItem key={grape} value={grape}>
                    {grape}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Vintage Filters */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
              <Typography variant="subtitle1">Vintage</Typography>
              <Tooltip title="Clear Vintage Filters">
                <IconButton size="small" onClick={() => handleClearFilterSection('vintage')}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
            {filters.vintages.map(vintage => (
              <FormControlLabel
                key={vintage}
                control={
                  <Checkbox
                    checked={selectedFilters.vintage.includes(vintage)}
                    onChange={() => handleFilterChange('vintage', vintage)}
                  />
                }
                label={vintage}
              />
            ))}

            {/* Display selected vintage filters as Chips */}
            {selectedFilters.vintage.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginBottom: '10px' }}>
                {selectedFilters.vintage.map(vintage => (
                  <Chip
                    key={vintage}
                    label={vintage}
                    onDelete={() => handleDeleteFilter('vintage', vintage)} // Remove vintage when "X" clicked
                  />
                ))}
              </Box>
            )}

   {/* country Filters */}
   {/* Country Filters */}
<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
  <Typography variant="subtitle1">Country</Typography>
  <Tooltip title="Clear Country Filters">
    <IconButton size="small" onClick={() => handleClearFilterSection('country')}>
      <ClearIcon />
    </IconButton>
  </Tooltip>
</Box>
{filters.countries.map((country) => (
  <FormControlLabel
    key={country}
    control={
      <Checkbox
        checked={selectedFilters.country.includes(country)}
        onChange={() => handleFilterChange('country', country)}
      />
    }
    label={country}
  />
))}

{/* Display selected country filters as Chips */}
{selectedFilters.country.length > 0 && (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginBottom: '10px' }}>
    {selectedFilters.country.map((country) => (
      <Chip
        key={country}
        label={country}
        onDelete={() => handleDeleteFilter('country', country)} // Remove country when "X" clicked
      />
    ))}
  </Box>
)}
            {/* Status Filters */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
              <Typography variant="subtitle1">Status</Typography>
              <Tooltip title="Clear Status Filters">
                <IconButton size="small" onClick={() => handleClearFilterSection('status')}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
            {filters.statuses.map(status => (
              <FormControlLabel
                key={status}
                control={
                  <Checkbox
                    checked={selectedFilters.status.includes(status)}
                    onChange={() => handleFilterChange('status', status)}
                  />
                }
                label={status}
              />
            ))}

            {/* Display selected status filters as Chips */}
            {selectedFilters.status.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginBottom: '10px' }}>
                {selectedFilters.status.map(status => (
                  <Chip
                    key={status}
                    label={status}
                    onDelete={() => handleDeleteFilter('status', status)} // Remove status when "X" clicked
                  />
                ))}
              </Box>
            )}

             {/* dateAdded Filters */}
             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
              <Typography variant="subtitle1">Date Added</Typography>
              <Tooltip title="Clear dateAdded Filters">
                <IconButton size="small" onClick={() => handleClearFilterSection('dateAdded')}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
            {filters.datesAdded.map(dateAdded => (
              <FormControlLabel
                key={dateAdded}
                control={
                  <Checkbox
                    checked={selectedFilters.dateAdded.includes(dateAdded)}
                    onChange={() => handleFilterChange('dateAdded', dateAdded)}
                  />
                }
                label={dateAdded}
              />
            ))}

            {/* Display selected dateAdded filters as Chips */}
            {selectedFilters.dateAdded.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginBottom: '10px' }}>
                {selectedFilters.dateAdded.map(dateAdded => (
                  <Chip
                    key={dateAdded}
                    label={dateAdded}
                    onDelete={() => handleDeleteFilter('dateAdded', dateAdded)} // Remove dateAdded when "X" clicked
                  />
                ))}
              </Box> )}

         

          </FormGroup>

          {/* Reset All Filters Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleResetFilters}
            sx={{ marginTop: '10px' }}
          >
            Reset All Filters
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default WineListFilters;
