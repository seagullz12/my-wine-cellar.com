import React from 'react';
import { Button, Typography, Card, CardContent, CardActions, Divider, CardMedia, Grid } from '@mui/material';

const SellWinePreview = ({ wine, price, quantity, condition, additionalInfo, onEdit, onPublish }) => {
  if (!wine) {
    return <Typography>No wine selected for preview.</Typography>;
  }

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center" sx={{ p: 1 }}>
      <CardContent>
        <CardMedia sx={{ marginBottom:2 }}>
        <img
          src={wine.images?.front?.desktop || wine.images?.back?.desktop}
          srcSet={`${wine.images?.front?.mobile || wine.images?.back?.mobile} 600w,
                      ${wine.images?.front?.desktop || wine.images?.back?.desktop} 1200w`}
          sizes="(max-width: 600px) 100vw, 1200px"
          alt={wine.name}
          className="wine-image"
          style={{ width: '100%', height: '300px', borderRadius: '8px'}}
        /></CardMedia>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Price per bottle:</strong> ${price}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Quantity:</strong> {quantity}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Condition:</strong> {condition}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          <strong>Additional Info:</strong> {additionalInfo || "N/A"}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', padding: 1}}>
        <Button variant="contained" color="secondary" onClick={onEdit} sx={{ width: '100%', marginRight:2}}>
          Edit
        </Button>
        <Button variant="contained" color="primary" onClick={onPublish} sx={{ width: '100%' }}>
          Publish
        </Button>
      </CardActions>
    </Grid>
  );
};

export default SellWinePreview;
