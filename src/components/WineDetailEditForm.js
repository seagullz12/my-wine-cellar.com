import React, { useState } from 'react';
import '../styles/WineDetailEditForm.css'; 

const WineDetailEditForm = ({ formData, handleChange, handleSubmit, handleEditToggle }) => {
  const [peakMaturityError, setPeakMaturityError] = useState(''); // State for peak maturity error message

  const handlePeakMaturityChange = (e) => {
    const { value } = e.target;

    // Validate peakMaturity input
    if (value && isNaN(value)) {
      setPeakMaturityError('Please fill in years as a number');
    } else {
      setPeakMaturityError(''); // Clear error if valid
    }

    handleChange(e); // Call the existing handleChange function to update formData
  };

  return (
    <form onSubmit={handleSubmit} className="wine-edit-form">
      <label>
        Name:
        <input
          type="text"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Grape:
        <input
          type="text"
          name="grape"
          value={formData.grape || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Vintage:
        <input
          type="text"
          name="vintage"
          value={formData.vintage || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Terroir:
        <input
          type="text"
          name="terroir"
          value={formData.terroir || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Region:
        <input
          type="text"
          name="region"
          value={formData.region || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Country:
        <input
          type="text"
          name="country"
          value={formData.country || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Producer:
        <input
          type="text"
          name="producer"
          value={formData.producer || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Alcohol Content:
        <input
          type="text"
          name="alcohol"
          value={formData.alcohol || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Quality Classification:
        <input
          type="text"
          name="classification"
          value={formData.classification || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Colour:
        <input
          type="text"
          name="colour"
          value={formData.colour || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Nose:
        <input
          type="text"
          name="nose"
          value={formData.nose || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Palate:
        <input
          type="text"
          name="palate"
          value={formData.palate || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Pairing:
        <input
          type="text"
          name="pairing"
          value={formData.pairing || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Peak Maturity: 
        <span> {formData.peakMaturity || 0} years</span>
        <input
          type="range"
          name="peakMaturity"
          min="0" 
          max="10"
          value={formData.peakMaturity || 3 }
          onChange={handlePeakMaturityChange}
        /> 
      </label>

      <label>
        Drinking Window:
        <input
          type="text"
          name="drinkingWindowLower"
          placeholder="Lower bound"
          value={formData.drinkingWindow?.lower || ''}
          onChange={handleChange}
        />
        <input
          type="text"
          name="drinkingWindowUpper"
          placeholder="Upper bound"
          value={formData.drinkingWindow?.upper || ''}
          onChange={handleChange}
        />
      </label>

      <label>
        Description:
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
        />
      </label>

      <button type="submit">Save</button>
      <button type="button" onClick={handleEditToggle}>Cancel</button>
    </form>
  );
};

export default WineDetailEditForm;
