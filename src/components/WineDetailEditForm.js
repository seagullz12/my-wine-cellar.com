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
        Region:
        <input
          type="text"
          name="region"
          value={formData.region || ''}
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

      <button type="submit">Save</button>
      <button type="button" onClick={handleEditToggle}>Cancel</button>
    </form>
  );
};

export default WineDetailEditForm;
