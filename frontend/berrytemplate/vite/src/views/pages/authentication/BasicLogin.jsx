import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, TextField, Button, Alert } from '@mui/material';
import logoImmagine from 'assets/images/logo.png'; // Usa il tuo nuovo logo!

const Login = () => {
    const navigate = useNavigate();
    const [credenziali, setCredenziali] = useState({ username: '', password: '' });
    const [errore, setErrore] = useState('');

    const handleChange = (e) => setCredenziali({ ...credenziali, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrore('');

        try {
            const res = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credenziali)
            });

            if (res.ok) {
                const data = await res.json();
                // Salviamo l'utente nel browser per ricordarci che è loggato!
                localStorage.setItem('utenteMediunicorn', JSON.stringify(data));
                // Lo mandiamo alla Dashboard
                navigate('/');
            } else {
                setErrore('Username o password errati. Riprova.');
            }
        } catch (err) {
            setErrore('Impossibile contattare il server.');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#e3f2fd' }}>
            <Card sx={{ maxWidth: 400, width: '100%', p: 2, borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>

                    <img src={logoImmagine} alt="MediUnicorn" width="80" style={{ borderRadius: '50%', marginBottom: '16px' }} />
                    <Typography variant="h3" color="primary" gutterBottom>MEDIUNICORN</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Inserisci le tue credenziali per accedere al gestionale.
                    </Typography>

                    {errore && <Alert severity="error" sx={{ mb: 2 }}>{errore}</Alert>}

                    <form onSubmit={handleLogin}>
                        <TextField fullWidth label="Username" name="username" variant="outlined" sx={{ mb: 2 }} value={credenziali.username} onChange={handleChange} />
                        <TextField fullWidth label="Password" name="password" type="password" variant="outlined" sx={{ mb: 3 }} value={credenziali.password} onChange={handleChange} />
                        <Button fullWidth type="submit" variant="contained" color="primary" size="large">
                            Accedi
                        </Button>
                    </form>

                </CardContent>
            </Card>
        </Box>
    );
};

export default Login;