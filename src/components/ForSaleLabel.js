// src/components/ForSaleLabel.js
import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import {Typography} from '@mui/material';

const ForSaleLabel = ({ price }) => {
    const forSale = {
        tooltipText: 'This wine is available for sale.',
        forSale: `For Sale: €${price}`,
        backgroundColor: 'ff8c00', // Adjust this color if needed
    };

    return (
        <Tooltip title={forSale.forSale}>
                <Chip
                    label={forSale.forSale}
                    style={{ opacity: '80%', backgroundColor: "#dc3545", color: '#fff' }}
                />
            </Tooltip>
    );
};

export default ForSaleLabel;
