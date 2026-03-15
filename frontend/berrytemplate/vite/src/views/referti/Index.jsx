import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button, MenuItem, Box, CircularProgress, Divider, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { IconCircleCheck, IconPaperclip, IconTrash } from '@tabler/icons-react';

const Referti = () => {
    const [prenotazioni, setPrenotazioni] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({ prenotazioneId: '', testoDiagnosi: '' });
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [visitaRefertata, setVisitaRefertata] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8080/api/referti/da-refertare')
            .then(res => res.json())
            .then(data => { setPrenotazioni(data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Funzione per gestire la selezione dei file
    const handleFileChange = (e) => {
        if (e.target.files) {
            // Aggiungiamo i nuovi file a quelli già selezionati
            const newFiles = Array.from(e.target.files);
            setSelectedFiles((prev) => [...prev, ...newFiles]);
        }
    };

    // Funzione per rimuovere un file dalla lista prima di inviarlo
    const handleRemoveFile = (indexToRemove) => {
        setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Creiamo un oggetto FormData invece del classico JSON
        const payload = new FormData();
        payload.append('prenotazioneId', formData.prenotazioneId);
        payload.append('testoDiagnosi', formData.testoDiagnosi);

        // Aggiungiamo tutti i file al FormData
        selectedFiles.forEach((file) => {
            payload.append('files', file);
        });

        try {
            const response = await fetch('http://localhost:8080/api/referti', {
                method: 'POST',
                // IMPORTANTE: Nessun header 'Content-Type'. Il browser lo imposta in automatico per FormData!
                body: payload,
            });

            if (response.ok) {
                const visita = prenotazioni.find(p => p.id === formData.prenotazioneId);
                setVisitaRefertata(visita);
                setIsSubmitted(true);
            } else {
                alert('Errore durante il salvataggio del referto sul server.');
            }
        } catch (error) {
            alert('Impossibile contattare il server.');
        }
    };

    const resetForm = () => window.location.reload();

    if (isSubmitted) {
        return (
            <Card sx={{ textAlign: 'center', py: 8, px: 2, boxShadow: 3, borderRadius: 3 }}>
                <CardContent>
                    <IconCircleCheck size={80} color="#4caf50" style={{ marginBottom: '16px' }} />
                    <Typography variant="h2" color="success.main" gutterBottom>Referto Salvato con Successo!</Typography>
                    <Typography variant="h5" color="textSecondary" sx={{ mb: 4 }}>
                        La diagnosi per <b>{visitaRefertata?.nome} {visitaRefertata?.cognome}</b> è stata registrata.
                    </Typography>
                    <Box sx={{ display: 'inline-block', textAlign: 'left', bgcolor: '#f8fafc', p: 3, borderRadius: 2, mb: 4, border: '1px solid #e0e0e0' }}>
                        <Typography variant="body1"><b>Prestazione:</b> {visitaRefertata?.prestazione?.nomeVisita}</Typography>
                        <Typography variant="body1"><b>Medico curante:</b> Dott. {visitaRefertata?.medico?.cognome}</Typography>
                        <Typography variant="body1" sx={{ mt: 2, color: '#2e7d32', fontWeight: 'bold' }}>✓ Visita completata.</Typography>
                        <Typography variant="body1" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>✓ Allegati salvati: {selectedFiles.length}</Typography>
                    </Box>
                    <Box><Button variant="contained" color="primary" size="large" onClick={resetForm}>Emetti un Nuovo Referto</Button></Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h3" gutterBottom>Emissione Nuovo Referto</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                    Seleziona una visita, inserisci la diagnosi e allega eventuali esami clinici (PDF, immagini, ecc.).
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

                    <Box>
                        {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}><CircularProgress size={24} sx={{ mr: 2 }} /><Typography>Ricerca visite in attesa...</Typography></Box>
                        ) : (
                            <TextField
                                select fullWidth label="Seleziona la Visita *" name="prenotazioneId"
                                value={formData.prenotazioneId} onChange={handleChange}
                                InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '56px' } }}
                            >
                                <MenuItem disabled value=""><em>Seleziona una visita in attesa</em></MenuItem>
                                {prenotazioni.length === 0 ? <MenuItem disabled value="empty">Nessuna visita in attesa di referto</MenuItem> :
                                    prenotazioni.map((v) => {
                                        const dataFormattata = new Date(v.dataOra).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
                                        return (
                                            <MenuItem key={v.id} value={v.id}>
                                                {dataFormattata} - Paziente: {v.nome} {v.cognome} ({v.prestazione.nomeVisita} con Dr. {v.medico.cognome})
                                            </MenuItem>
                                        );
                                    })
                                }
                            </TextField>
                        )}
                    </Box>

                    <Box>
                        <TextField
                            fullWidth multiline rows={8} label="Testo della Diagnosi *" name="testoDiagnosi"
                            value={formData.testoDiagnosi} onChange={handleChange}
                            placeholder="Inserisci qui i dettagli clinici..." InputLabelProps={{ shrink: true }}
                        />
                    </Box>

                    {/* NUOVA SEZIONE: GESTIONE ALLEGATI */}
                    <Box sx={{ p: 2, border: '1px dashed #bdbdbd', borderRadius: 2, bgcolor: '#fafafa' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h5" color="primary">Allegati Referto (Opzionale)</Typography>
                            {/* Il bottone triggera l'input file nascosto */}
                            <Button component="label" variant="outlined" startIcon={<IconPaperclip />}>
                                Carica File
                                <input type="file" hidden multiple onChange={handleFileChange} />
                            </Button>
                        </Box>

                        {/* Lista dei file selezionati */}
                        {selectedFiles.length > 0 ? (
                            <List dense>
                                {selectedFiles.map((file, index) => (
                                    <ListItem key={index} sx={{ bgcolor: '#fff', mb: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <ListItemIcon><IconPaperclip size={20} /></ListItemIcon>
                                        <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(1)} KB`} />
                                        <IconButton edge="end" color="error" onClick={() => handleRemoveFile(index)}>
                                            <IconTrash size={20} />
                                        </IconButton>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="textSecondary">Nessun file selezionato.</Typography>
                        )}
                    </Box>

                    <Box>
                        <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 'bold' }}>* I campi contrassegnati da asterisco sono obbligatori.</Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={handleSubmit} variant="contained" color="secondary" size="large" disabled={prenotazioni.length === 0 || !formData.testoDiagnosi || !formData.prenotazioneId}>
                                Salva Referto Definitivo
                            </Button>
                        </Box>
                    </Box>

                </Box>
            </CardContent>
        </Card>
    );
};

export default Referti;