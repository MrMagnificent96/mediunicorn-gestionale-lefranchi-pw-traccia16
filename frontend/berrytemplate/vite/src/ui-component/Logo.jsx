import React from 'react';
import { Box, Typography } from '@mui/material';
import logoImmagine from 'assets/images/logo.png';

const Logo = () => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 3 }}>

            <img src={logoImmagine} alt="MediUnicorn" width="45" style={{ borderRadius: '50%' }} />

            <Typography
                variant="h3"
                sx={{
                    color: '#1976d2',
                    fontWeight: 'bold',
                    letterSpacing: 1,
                    fontFamily: "'Inter', sans-serif"
                }}
            >
                MEDIUNICORN
            </Typography>
        </Box>
    );
};

export default Logo;