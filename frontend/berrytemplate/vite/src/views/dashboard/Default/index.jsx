import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, TextField, Button, Box, Paper, CircularProgress } from '@mui/material';
import { IconCoin, IconStethoscope, IconCalendarEvent, IconFilter } from '@tabler/icons-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  // Stato per i filtri data
  const [filtri, setFiltri] = useState({ dataDa: '', dataA: '' });

  // STATO AGGIORNATO: Nomi coerenti con il DTO Java StatisticheResponse
  const [statistiche, setStatistiche] = useState({
    incassoTotale: 0,
    fattureInSospeso: 0,
    totaleVisiteEffettuate: 0
  });

  const caricaStatistiche = () => {
    setLoading(true);
    let url = 'http://localhost:8080/api/finanze/statistiche';
    const params = [];
    if (filtri.dataDa) params.push(`da=${filtri.dataDa}`);
    if (filtri.dataA) params.push(`a=${filtri.dataA}`);

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    fetch(url)
        .then(res => res.json())
        .then(data => {
          setStatistiche(prev => ({ ...prev, ...data }));
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
  };

  useEffect(() => {
    caricaStatistiche();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    setFiltri({ ...filtri, [e.target.name]: e.target.value });
  };

  const handleApplicaFiltri = () => {
    caricaStatistiche();
  };

  const handleResettaFiltri = () => {
    setFiltri({ dataDa: '', dataA: '' });
    setTimeout(() => {
      fetch('http://localhost:8080/api/finanze/statistiche')
          .then(res => res.json())
          .then(data => setStatistiche(prev => ({ ...prev, ...data })));
    }, 100);
  };

  // --- SAFE FALLBACKS CON I NOMI CORRETTI ---
  // Ci assicuriamo che i valori siano sempre numeri validi
  const incassoSicuro = Number(statistiche?.incassoTotale) || 0;
  const inSospesoSicuro = Number(statistiche?.fattureInSospeso) || 0;
  const visiteTotaliSicuro = Number(statistiche?.totaleVisiteEffettuate) || 0;

  return (
      <Box>
        <Typography variant="h3" gutterBottom sx={{ mb: 3 }}>
          Dashboard Economica
        </Typography>

        <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="h5" color="primary" gutterBottom sx={{ mb: 2 }}>
            Filtra per Periodo
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField fullWidth type="date" label="Data Inizio (Da)" name="dataDa" value={filtri.dataDa} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth type="date" label="Data Fine (A)" name="dataA" value={filtri.dataA} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" color="primary" size="large" onClick={handleApplicaFiltri} startIcon={<IconFilter />}>
                  Applica
                </Button>
                <Button variant="outlined" color="secondary" size="large" onClick={handleResettaFiltri}>
                  Resetta
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
        ) : (
            <Grid container spacing={4}>

              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h4" color="inherit">Fatturato Netto</Typography>
                      <IconCoin size={40} opacity={0.6} />
                    </Box>
                    <Typography variant="h1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                      € {incassoSicuro.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="body2">
                      Totale incassi visite completate nel periodo
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: '#fff3e0', color: '#e65100', border: '1px solid #ffe0b2', borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h4" color="inherit">Visite Da Refertare</Typography>
                      <IconStethoscope size={40} opacity={0.6} />
                    </Box>
                    <Typography variant="h1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                      {inSospesoSicuro}
                    </Typography>
                    <Typography variant="body2">
                      Pazienti in attesa di diagnosi nel periodo
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: '#e3f2fd', color: '#1565c0', border: '1px solid #bbdefb', borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h4" color="inherit">Volume Prenotazioni</Typography>
                      <IconCalendarEvent size={40} opacity={0.6} />
                    </Box>
                    <Typography variant="h1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                      {visiteTotaliSicuro}
                    </Typography>
                    <Typography variant="body2">
                      Tra visite concluse e in attesa nel periodo
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

            </Grid>
        )}
      </Box>
  );
};

export default Dashboard;