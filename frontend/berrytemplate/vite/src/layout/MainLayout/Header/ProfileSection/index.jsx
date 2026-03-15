import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Material-ui
import {
    Avatar, Box, Chip, Divider, List, ListItemButton,
    ListItemIcon, ListItemText, Typography, Menu
} from '@mui/material';

// Icons
import { IconLogout, IconSettings } from '@tabler/icons-react';

const ProfileSection = () => {
    const navigate = useNavigate();

    // Usiamo lo stato per gestire l'elemento di ancoraggio
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Recuperiamo i dati dell'utente
    const utenteString = localStorage.getItem('utenteMediunicorn');
    const utente = utenteString ? JSON.parse(utenteString) : { nome: 'Amministratore', ruolo: 'ADMIN' };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('utenteMediunicorn');
        handleClose();
        navigate('/login');
    };

    return (
        <>
            <Chip
                sx={{
                    height: '48px',
                    alignItems: 'center',
                    borderRadius: '27px',
                    transition: 'all .2s ease-in-out',
                    borderColor: '#e3f2fd',
                    backgroundColor: '#e3f2fd',
                    '&:hover': {
                        borderColor: '#2196f3',
                        background: '#2196f3',
                        color: '#fff',
                        '& svg': { stroke: '#e3f2fd' }
                    }
                }}
                icon={<Avatar sx={{ cursor: 'pointer', margin: '8px 0 8px 8px !important' }} />}
                label={<IconSettings stroke={1.5} size="1.5rem" />}
                variant="outlined"
                onClick={handleClick}
                color="primary"
            />

            <Menu
                anchorEl={anchorEl}
                id="profile-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                // Posizionamento forzato in basso a destra rispetto al chip
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        minWidth: 200,
                        borderRadius: 2,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': { // La freccetta che punta verso l'alto
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
            >
                <Box sx={{ p: 2, pb: 0 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{utente.nome}</Typography>
                    <Typography variant="subtitle2" color="textSecondary">{utente.ruolo}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <List component="nav" sx={{ p: 0 }}>
                    <ListItemButton onClick={handleLogout} sx={{ py: 1.5 }}>
                        <ListItemIcon>
                            <IconLogout stroke={1.5} size="1.3rem" color="#d32f2f" />
                        </ListItemIcon>
                        <ListItemText
                            primary={<Typography color="error" variant="body2" sx={{ fontWeight: 500 }}>Esci (Logout)</Typography>}
                        />
                    </ListItemButton>
                </List>
            </Menu>
        </>
    );
};

export default ProfileSection;