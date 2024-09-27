import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Slider,
  IconButton,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

const WineDetailEditForm = ({ formData, handleChange, handleSubmit, handleEditToggle }) => {
  const [peakMaturityError, setPeakMaturityError] = useState('');

  // Helper function to handle array changes
  const handleArrayChange = (e, index, field) => {
    const newArray = [...formData[field]];
    newArray[index] = e.target.value;
    handleChange({ target: { name: field, value: newArray } });
  };

  // Function to add a new entry to an array
  const addArrayItem = (field) => {
    handleChange({ target: { name: field, value: [...formData[field], ''] } });
  };

  // Function to remove an entry from an array
  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    handleChange({ target: { name: field, value: newArray } });
  };

  const handlePeakMaturityChange = (event, newValue) => {
    handleChange({ target: { name: 'peakMaturity', value: newValue } });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '20px',
        backgroundColor: '#f8f8f8',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Edit Wine Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Vintage"
            name="vintage"
            value={formData.vintage || ''}
            onChange={handleChange}
            
          />
        </Grid>

        {/* Grape Field as Array */}
        <Grid item xs={12}>
          <Typography variant="h6">Grape</Typography>
          {formData.grape.map((grape, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                value={grape || ''}
                onChange={(e) => handleArrayChange(e, index, 'grape')}
                
                style={{ marginRight: '8px' }}
              />
              <IconButton onClick={() => removeArrayItem('grape', index)} color="secondary">
                <Remove />
              </IconButton>
            </div>
          ))}
          <Button sx={{marginTop:1}} variant="contained" color="primary" onClick={() => addArrayItem('grape')}>
            Add Grape
          </Button>
        </Grid>

        {/* Region Field */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Region"
            name="region"
            value={formData.region || ''}
            onChange={handleChange}
            
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Country"
            name="country"
            value={formData.country || ''}
            onChange={handleChange}
            
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Producer"
            name="producer"
            value={formData.producer || ''}
            onChange={handleChange}
            
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Alcohol Content"
            name="alcohol"
            value={formData.alcohol || ''}
            onChange={handleChange}
            
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Quality Classification</Typography>
          {formData.classification.map((classification, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                value={classification || ''}
                onChange={(e) => handleArrayChange(e, index, 'classification')}
                
                style={{ marginRight: '8px' }}
              />
              <IconButton onClick={() => removeArrayItem('classification', index)} color="secondary">
                <Remove />
              </IconButton>
            </div>
          ))}
          <Button sx={{marginTop:1}} variant="contained" color="primary" onClick={() => addArrayItem('classification')}>
            Add Classification
          </Button>
        </Grid>

        {/* Similar fields for Nose, Palate, and Pairing as arrays */}
        {['nose', 'palate', 'pairing'].map((field) => (
          <Grid item xs={12} key={field}>
            <Typography variant="h6">{field.charAt(0).toUpperCase() + field.slice(1)}</Typography>
            {formData[field].map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  value={item || ''}
                  onChange={(e) => handleArrayChange(e, index, field)}
                  
                  style={{ marginRight: '8px' }}
                />
                <IconButton onClick={() => removeArrayItem(field, index)} color="secondary">
                  <Remove />
                </IconButton>
              </div>
            ))}
            <Button sx={{marginTop:1}} variant="contained" color="primary" onClick={() => addArrayItem(field)}>
              Add {field.charAt(0).toUpperCase() + field.slice(1)}
            </Button>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Typography gutterBottom>Peak Maturity: {formData.peakMaturity || 0} years</Typography>
          <Slider
            value={formData.peakMaturity || 3}
            onChange={handlePeakMaturityChange}
            aria-labelledby="peak-maturity-slider"
            min={0}
            max={10}
            valueLabelDisplay="auto"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Drinking Window Lower Bound"
            name="drinkingWindowLower"
            value={formData.drinkingWindow?.lower || ''}
            onChange={handleChange}
            
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Drinking Window Upper Bound"
            name="drinkingWindowUpper"
            value={formData.drinkingWindow?.upper || ''}
            onChange={handleChange}
            
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            multiline
            rows={4}
            
          />
        </Grid>
      </Grid>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" type="submit" style={{ marginRight: '10px' }}>
          Save changes
        </Button>
        <Button variant="outlined" color="grey" onClick={handleEditToggle}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default WineDetailEditForm;
