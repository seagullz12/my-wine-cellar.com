// WineDetailEditForm.js
import React from 'react';
import '../styles/WineDetailEditForm.css'; // Optional: create a separate CSS for this form

const WineDetailEditForm = ({ formData, handleChange, handleSubmit, handleEditToggle }) => {
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
          type="number"
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
          name="alcoholContent"
          value={formData.alcoholContent || ''}
          onChange={handleChange}
        />
      </label>

      <label>
        Quality Classification:
        <input
          type="text"
          name="qualityClassification"
          value={formData.qualityClassification || ''}
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

      <button type="submit">Save</button>
      <button type="button" onClick={handleEditToggle}>Cancel</button>
    </form>
  );
};

export default WineDetailEditForm;
