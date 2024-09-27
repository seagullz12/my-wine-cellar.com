import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const WineDrinkingWindowChart = ({ vintage, name, drinkingWindow }) => {
    const theme = useTheme();

    // Convert string values to integers
    const vintageYear = parseInt(vintage, 10);
    const lowerBoundary = parseInt(drinkingWindow.lower, 10);
    const upperBoundary = parseInt(drinkingWindow.upper, 10);
    const currentYear = new Date().getFullYear();

    // Calculate total years and width
    const totalWidth = (upperBoundary - vintageYear) + (lowerBoundary - vintageYear);
    const totalYears = upperBoundary - vintageYear;
    const currentYearPosition = ((currentYear - vintageYear) / totalWidth) * 100;

    // Calculate positions for the bars
    const optimalWindowStart = ((lowerBoundary - vintageYear) / totalWidth) * 100;
    const optimalWindowLength = ((upperBoundary - lowerBoundary) / totalWidth) * 100;

    return (
        <Box sx={{ position: 'relative', width: '90%', maxWidth: '700px', height: '100px', margin: '30px auto' }}>
            <Typography variant="h5" textAlign="center" marginBottom={2} sx={{ fontSize: '1.25rem' }}>
                Optimal Drinking Window
            </Typography>
            {/* Timeline */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '0',
                    right: '0',
                    height: '4px',
                    backgroundColor: '#d3d3d3',
                    transform: 'translateY(-50%)',
                }}
            />
            {/* Optimal Drinking Window Bar */}
            <Box
                sx={{
                    position: 'absolute',
                    height: '100%',
                    backgroundColor: theme.palette.primary.light,
                    width: `${optimalWindowLength}%`,
                    left: `${optimalWindowStart}%`,
                }}
            />
            {/* Black Stripe for Current Year */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '0',
                    bottom: '0',
                    width: '2px',
                    backgroundColor: 'black',
                    left: `${currentYearPosition}%`,
                }}
            />
            {/* Current Year Marker */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '70%',
                    fontWeight: 'bold',
                    color: theme.palette.text.primary,
                    borderRadius: '4px',
                    padding: '2px 5px',
                    backgroundColor: theme.palette.secondary.main,
                    left: `${currentYearPosition}%`,
                    bottom: "10x"
                }}
            >
                {"now"}
            </Box>
            {/* Year Labels */}
            {[...Array(totalWidth + 1)].map((_, index) => {
                const year = vintageYear + index;
                const yearPosition = (index / totalWidth) * 100;
                return (
                    <Typography
                        key={index}
                        sx={{
                            position: 'absolute',
                            bottom: '0',
                            left: `${yearPosition}%`,
                            transform: 'translateX(-50%)',
                            fontSize: { xs: '0.6rem', sm: '0.75rem' },
                            color: '#333',
                        }}
                    >
                        {year}
                    </Typography>
                );
            })}
        </Box>
    );
};

export default WineDrinkingWindowChart;
