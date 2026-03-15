import React, { useState, useEffect } from 'react';
import {
    Card, CardContent, Typography, Grid, TextField, Button, MenuItem,
    Box, Stepper, Step, StepLabel, Divider, CircularProgress, Alert, Checkbox, FormControlLabel, Paper
} from '@mui/material';
import { IconCircleCheck } from '@tabler/icons-react';

const steps = ['Dettagli Visita', 'Data e Ora', 'Dati Paziente', 'Riepilogo e Conferma'];

// --- FUNZIONI DI VALIDAZIONE ---
const validaCodiceFiscale = (cf) => {
    if (!cf || cf.length !== 16) return false;
    cf = cf.toUpperCase();
    if (!/^[A-Z]{6}\d{2}[A-EHLMPR-T]\d{2}[A-Z\d]{4}[A-Z]$/.test(cf)) return false;
    const setPari = { '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9, 'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15, 'Q': 16, 'R': 17, 'S': 18, 'T': 19, 'U': 20, 'V': 21, 'W': 22, 'X': 23, 'Y': 24, 'Z': 25 };
    const setDisp = { '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21, 'A': 1, 'B': 0, 'C': 5, 'D': 7, 'E': 9, 'F': 13, 'G': 15, 'H': 17, 'I': 19, 'J': 21, 'K': 2, 'L': 4, 'M': 18, 'N': 20, 'O': 11, 'P': 3, 'Q': 6, 'R': 8, 'S': 12, 'T': 14, 'U': 16, 'V': 10, 'W': 22, 'X': 25, 'Y': 24, 'Z': 23 };
    let somma = 0;
    for (let i = 1; i <= 15; i++) {
        const c = cf[i - 1];
        somma += (i % 2 === 0) ? setPari[c] : setDisp[c];
    }
    return String.fromCharCode(somma % 26 + 65) === cf[15];
};
const validaEmail = (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validaCellulare = (cellulare) => !cellulare || /^(\+39\s?)?3\d{2}[\s\-]?\d{6,7}$/.test(cellulare);
const validaTelefonoFisso = (fisso) => !fisso || /^(\+39\s?)?0\d{1,4}[\s\-]?\d{5,8}$/.test(fisso);

const PrenotazioniWizard = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Dati delle chiamate API interne
    const [sedi, setSedi] = useState([]);
    const [specializzazioni, setSpecializzazioni] = useState([]);
    const [prestazioni, setPrestazioni] = useState([]);
    const [medici, setMedici] = useState([]);
    const [orari, setOrari] = useState([]);
    const [prezzoSelezionato, setPrezzoSelezionato] = useState(0);

    // --- STATI PER ANAGRAFICA ITALIANA ---
    const [datiItalia, setDatiItalia] = useState([]);
    const [province, setProvince] = useState([]);
    const [comuniOpzioni, setComuniOpzioni] = useState([]);
    const [capOpzioni, setCapOpzioni] = useState([]);

    const [formData, setFormData] = useState({
        sedeId: '', specializzazione: '', prestazioneId: '', medicoId: '',
        dataVisita: '', oraVisita: '',
        nome: '', cognome: '', dataNascita: '', codiceFiscale: '',
        indirizzo: '', statoAppartenenza: 'Italia', provincia: '', comune: '', cap: '',
        cellulare: '', telefonoFisso: '', email: '', note: '', consensoPrivacy: false
    });

    const oggiStr = new Date().toISOString().split('T')[0];

    useEffect(() => {
        fetch('http://localhost:8080/api/booking/sedi').then(res => res.json()).then(setSedi);
        fetch('http://localhost:8080/api/booking/specializzazioni').then(res => res.json()).then(setSpecializzazioni);

        // FETCH DATI ITALIA
        fetch('https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json')
            .then(res => res.json())
            .then(data => {
                setDatiItalia(data);
                const provMap = new Map();
                data.forEach(c => {
                    if (!provMap.has(c.sigla)) {
                        provMap.set(c.sigla, { sigla: c.sigla, nome: c.provincia.nome });
                    }
                });
                setProvince(Array.from(provMap.values()).sort((a, b) => a.nome.localeCompare(b.nome)));
            })
            .catch(err => console.error("Errore nel caricamento dei comuni", err));
    }, []);

    useEffect(() => {
        if (formData.specializzazione) {
            fetch(`http://localhost:8080/api/booking/prestazioni?specializzazione=${formData.specializzazione}`)
                .then(res => res.json())
                .then(data => { setPrestazioni(data); setFormData(prev => ({...prev, prestazioneId: '', medicoId: ''})); });
        }
    }, [formData.specializzazione]);

    useEffect(() => {
        if (formData.prestazioneId && formData.sedeId) {
            const prestazioneScelta = prestazioni.find(p => p.id === formData.prestazioneId);
            if (prestazioneScelta) setPrezzoSelezionato(prestazioneScelta.prezzo);

            fetch(`http://localhost:8080/api/booking/medici?specializzazione=${formData.specializzazione}&sedeId=${formData.sedeId}`)
                .then(res => res.json()).then(setMedici);
        }
    }, [formData.prestazioneId, formData.sedeId, prestazioni, formData.specializzazione]);

    useEffect(() => {
        if (formData.dataVisita) {
            setLoading(true);
            let url = `http://localhost:8080/api/booking/orari-liberi?data=${formData.dataVisita}`;
            if (formData.medicoId) url += `&medicoId=${formData.medicoId}`;

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    let orariFiltrati = data;
                    if (formData.dataVisita === oggiStr) {
                        const oraAttuale = new Date();
                        const hAttuale = oraAttuale.getHours();
                        const mAttuale = oraAttuale.getMinutes();

                        orariFiltrati = data.filter(orario => {
                            const [h, m] = orario.split(':').map(Number);
                            return h > hAttuale || (h === hAttuale && m > mAttuale);
                        });
                    }
                    setOrari(orariFiltrati);
                    if (orariFiltrati.length > 0) setFormData(prev => ({...prev, oraVisita: orariFiltrati[0]}));
                    else setFormData(prev => ({...prev, oraVisita: ''}));
                    setLoading(false);
                });
        }
    }, [formData.dataVisita, formData.medicoId, oggiStr]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = name === 'codiceFiscale' ? value.toUpperCase() : value;

        let updatedData = { ...formData, [name]: type === 'checkbox' ? checked : finalValue };

        if (name === 'statoAppartenenza' && finalValue !== 'Italia') {
            updatedData.provincia = '';
            updatedData.comune = '';
            updatedData.cap = '';
        }

        // Livello 1: Selezione della Provincia sblocca i Comuni
        if (name === 'provincia' && formData.statoAppartenenza === 'Italia') {
            updatedData.comune = '';
            updatedData.cap = '';
            const filtrati = datiItalia.filter(c => c.sigla === finalValue).sort((a, b) => a.nome.localeCompare(b.nome));
            setComuniOpzioni(filtrati);
            setCapOpzioni([]);
        }

        // Livello 2: Selezione del Comune abilita l'autocompilazione del CAP
        if (name === 'comune' && formData.statoAppartenenza === 'Italia') {
            updatedData.cap = '';
            const selectedComune = comuniOpzioni.find(c => c.nome === finalValue);
            if (selectedComune && selectedComune.cap) {
                setCapOpzioni(selectedComune.cap);
                if (selectedComune.cap.length === 1) {
                    updatedData.cap = selectedComune.cap[0];
                }
            } else {
                setCapOpzioni([]);
            }
        }

        setFormData(updatedData);

        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: false }));
        if (['cellulare', 'telefonoFisso', 'email'].includes(name)) {
            setFieldErrors(prev => ({ ...prev, cellulare: false, telefonoFisso: false, email: false }));
        }
    };

    const handleNext = () => {
        setErrorMsg('');
        let errors = {};
        let isValid = true;
        let customErrorMsg = '';

        if (activeStep === 0) {
            if (!formData.sedeId) errors.sedeId = true;
            if (!formData.specializzazione) errors.specializzazione = true;
            if (!formData.prestazioneId) errors.prestazioneId = true;

            if (Object.keys(errors).length > 0) {
                isValid = false;
                customErrorMsg = 'Compila i campi evidenziati in rosso.';
            } else if (medici.length === 0) {
                isValid = false;
                customErrorMsg = 'Nessun medico disponibile per la combinazione selezionata. Impossibile proseguire.';
            }
        }

        if (activeStep === 1) {
            if (!formData.dataVisita) errors.dataVisita = true;
            if (!formData.oraVisita) errors.oraVisita = true;

            if (formData.dataVisita && formData.oraVisita) {
                const dataSelezionata = new Date(`${formData.dataVisita}T${formData.oraVisita}`);
                const adesso = new Date();
                if (dataSelezionata <= adesso) {
                    errors.dataVisita = true; errors.oraVisita = true; isValid = false;
                    customErrorMsg = 'Attenzione: non puoi inserire un appuntamento nel passato. Scegli un orario futuro.';
                }
            }

            if (Object.keys(errors).length > 0 && isValid !== false) {
                isValid = false; customErrorMsg = 'Seleziona una data e un orario per proseguire.';
            }
        }

        if (activeStep === 2) {
            const requiredFields = ['nome', 'cognome', 'dataNascita', 'codiceFiscale', 'indirizzo', 'statoAppartenenza', 'provincia', 'comune', 'cap'];
            requiredFields.forEach(field => {
                if (!formData[field]) errors[field] = true;
            });

            if (Object.keys(errors).length > 0) {
                isValid = false; customErrorMsg = 'I campi evidenziati in rosso sono obbligatori e non possono essere lasciati vuoti.';
            }

            if (!formData.cellulare && !formData.telefonoFisso && !formData.email) {
                errors.cellulare = true; errors.telefonoFisso = true; errors.email = true;
                isValid = false; customErrorMsg = 'È obbligatorio inserire almeno un recapito valido per contattare il paziente.';
            } else {
                if (!validaEmail(formData.email)) { errors.email = true; isValid = false; customErrorMsg = "Formato Email non valido."; }
                if (!validaCellulare(formData.cellulare)) { errors.cellulare = true; isValid = false; customErrorMsg = "Cellulare deve contenere 9 o 10 cifre."; }
                if (!validaTelefonoFisso(formData.telefonoFisso)) { errors.telefonoFisso = true; isValid = false; customErrorMsg = "Telefono Fisso non valido."; }
            }

            if (formData.codiceFiscale && !validaCodiceFiscale(formData.codiceFiscale)) {
                errors.codiceFiscale = true; isValid = false; customErrorMsg = 'Il Codice Fiscale inserito non risulta valido.';
            }

            if (!formData.consensoPrivacy) {
                errors.consensoPrivacy = true; isValid = false; customErrorMsg = 'Devi accettare il consenso alla privacy per procedere.';
            }
        }

        setFieldErrors(errors);
        if (!isValid) setErrorMsg(customErrorMsg);
        if (isValid) setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => { setActiveStep((prev) => prev - 1); setErrorMsg(''); setFieldErrors({}); };

    const handleSubmit = async () => {
        try {
            const payload = { ...formData, medicoId: formData.medicoId === '' ? null : formData.medicoId };
            const response = await fetch('http://localhost:8080/api/booking/prenota', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) { setIsSubmitted(true); }
            else { setErrorMsg('Errore durante il salvataggio della prenotazione.'); }
        } catch (error) { setErrorMsg('Impossibile contattare il server.'); }
    };

    const resetForm = () => window.location.reload();
    const getSedeNome = () => sedi.find(s => s.id === formData.sedeId)?.nome || '';
    const getPrestazioneNome = () => prestazioni.find(p => p.id === formData.prestazioneId)?.nomeVisita || '';
    const getMedicoNome = () => {
        if (!formData.medicoId) return 'Assegnazione Automatica (Nessuna preferenza)';
        const m = medici.find(m => m.id === formData.medicoId);
        return m ? `Dott. ${m.nome} ${m.cognome}` : '';
    };

    if (isSubmitted) {
        return (
            <Card sx={{ textAlign: 'center', py: 8, px: 2, boxShadow: 3, borderRadius: 3 }}>
                <CardContent>
                    <IconCircleCheck size={80} color="#4caf50" style={{ marginBottom: '16px' }} />
                    <Typography variant="h2" color="success.main" gutterBottom>Prenotazione Confermata!</Typography>
                    <Typography variant="h5" color="textSecondary" sx={{ mb: 4 }}>
                        La visita per <b>{formData.nome} {formData.cognome}</b> è stata registrata con successo nel sistema.
                    </Typography>
                    <Box sx={{ display: 'inline-block', textAlign: 'left', bgcolor: '#f8fafc', p: 3, borderRadius: 2, mb: 4, border: '1px solid #e0e0e0' }}>
                        <Typography variant="body1"><b>Data:</b> {formData.dataVisita}</Typography>
                        <Typography variant="body1"><b>Orario:</b> {formData.oraVisita}</Typography>
                        <Typography variant="body1"><b>Sede:</b> {getSedeNome()}</Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                            Ti ricordiamo che l'importo di <b>€ {(prezzoSelezionato + 2).toFixed(2)}</b> dovrà essere saldato in struttura.
                        </Typography>
                    </Box>
                    <Box><Button variant="contained" color="primary" size="large" onClick={resetForm}>Nuova Prenotazione</Button></Box>
                </CardContent>
            </Card>
        );
    }

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField select fullWidth label="Sede della visita *" name="sedeId" value={formData.sedeId} onChange={handleChange} error={!!fieldErrors.sedeId} InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '56px' } }}>
                                    <MenuItem disabled value=""><em>Seleziona una sede</em></MenuItem>
                                    {sedi.map(s => <MenuItem key={s.id} value={s.id}>{s.nome} - {s.indirizzo}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField select fullWidth label="Specializzazione *" name="specializzazione" value={formData.specializzazione} onChange={handleChange} disabled={!formData.sedeId} error={!!fieldErrors.specializzazione} InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '56px' } }}>
                                    <MenuItem disabled value=""><em>Seleziona specializzazione</em></MenuItem>
                                    {specializzazioni.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField select fullWidth label="Prestazione *" name="prestazioneId" value={formData.prestazioneId} onChange={handleChange} disabled={!formData.specializzazione} error={!!fieldErrors.prestazioneId} InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '56px' } }}>
                                    <MenuItem disabled value=""><em>Seleziona prestazione</em></MenuItem>
                                    {prestazioni.map(p => <MenuItem key={p.id} value={p.id}>{p.nomeVisita}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField select fullWidth label="Scelta Medico" name="medicoId" value={formData.medicoId} onChange={handleChange} disabled={!formData.prestazioneId || medici.length === 0} InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '56px' } }}>
                                    {formData.prestazioneId && medici.length === 0 ? (
                                        <MenuItem value=""><em>Nessun medico disponibile</em></MenuItem>
                                    ) : (
                                        <MenuItem value=""><em>Nessuna preferenza (Assegnazione automatica)</em></MenuItem>
                                    )}
                                    {medici.map(m => <MenuItem key={m.id} value={m.id}>Dott. {m.nome} {m.cognome}</MenuItem>)}
                                </TextField>
                            </Grid>
                            {formData.prestazioneId && medici.length === 0 && (
                                <Grid item xs={12}>
                                    <Alert severity="warning">Attenzione: Non ci sono medici associati a questa combinazione. Scegli un'altra struttura.</Alert>
                                </Grid>
                            )}
                        </Grid>
                        {formData.prestazioneId && medici.length > 0 && (
                            <Box sx={{ mt: 5, p: 3, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #90caf9', width: '100%' }}>
                                <Typography variant="h5" color="primary" gutterBottom>Costo Stimato</Typography>
                                <Grid container justifyContent="space-between"><Typography>Costo Visita:</Typography><Typography>€ {prezzoSelezionato.toFixed(2)}</Typography></Grid>
                                <Grid container justifyContent="space-between" sx={{ mt: 1 }}><Typography>Marca da bollo:</Typography><Typography>€ 2.00</Typography></Grid>
                                <Divider sx={{ my: 2 }} />
                                <Grid container justifyContent="space-between"><Typography variant="h4" color="primary">Totale:</Typography><Typography variant="h4" color="primary">€ {(prezzoSelezionato + 2).toFixed(2)}</Typography></Grid>
                            </Box>
                        )}
                    </Box>
                );
            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="date" label="Giorno della visita *" name="dataVisita" value={formData.dataVisita} onChange={handleChange} error={!!fieldErrors.dataVisita} InputLabelProps={{ shrink: true }} inputProps={{ min: oggiStr }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {loading ? <CircularProgress /> : (
                                <TextField select fullWidth label="Orario disponibile *" name="oraVisita" value={formData.oraVisita} onChange={handleChange} disabled={!formData.dataVisita || orari.length === 0} error={!!fieldErrors.oraVisita} InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '56px' } }}>
                                    {orari.length === 0 ? <MenuItem disabled value=""><em>Nessun orario libero</em></MenuItem> : orari.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                </TextField>
                            )}
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Box>
                        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="h5" color="primary" gutterBottom>Dati Anagrafici</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}><TextField fullWidth label="Nome *" name="nome" value={formData.nome} onChange={handleChange} error={!!fieldErrors.nome} /></Grid>
                                <Grid item xs={12} sm={6}><TextField fullWidth label="Cognome *" name="cognome" value={formData.cognome} onChange={handleChange} error={!!fieldErrors.cognome} /></Grid>
                                <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Data di Nascita *" name="dataNascita" value={formData.dataNascita} onChange={handleChange} error={!!fieldErrors.dataNascita} InputLabelProps={{ shrink: true }} /></Grid>
                                <Grid item xs={12} sm={6}><TextField fullWidth label="Codice Fiscale *" name="codiceFiscale" value={formData.codiceFiscale} onChange={handleChange} error={!!fieldErrors.codiceFiscale} inputProps={{ maxLength: 16 }} helperText={fieldErrors.codiceFiscale ? "Formato o controllo errato" : ""} /></Grid>
                            </Grid>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="h5" color="primary" gutterBottom>Residenza</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Indirizzo (Via/Piazza e civico) *" name="indirizzo" value={formData.indirizzo} onChange={handleChange} error={!!fieldErrors.indirizzo} />
                                </Grid>

                                {/* --- FIX AGGIUNTI: InputLabelProps & SelectProps in Stato, Provincia, Comune e Cap --- */}

                                {/* --- STATO --- */}
                                <Grid item xs={12} sm={3}>
                                    <TextField select fullWidth label="Stato *" name="statoAppartenenza" value={formData.statoAppartenenza} onChange={handleChange} error={!!fieldErrors.statoAppartenenza} InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '56px' } }}>
                                        <MenuItem value="Italia">Italia</MenuItem>
                                        <MenuItem value="Estero">Estero</MenuItem>
                                    </TextField>
                                </Grid>

                                {/* --- PROVINCIA --- */}
                                <Grid item xs={12} sm={3}>
                                    {formData.statoAppartenenza === 'Italia' ? (
                                        <TextField select fullWidth label="Provincia *" name="provincia" value={formData.provincia} onChange={handleChange} error={!!fieldErrors.provincia} InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '56px' }, MenuProps: { style: { maxHeight: 300 } } }}>
                                            <MenuItem disabled value=""><em>Seleziona</em></MenuItem>
                                            {province.map(p => <MenuItem key={p.sigla} value={p.sigla}>{p.nome} ({p.sigla})</MenuItem>)}
                                        </TextField>
                                    ) : (
                                        <TextField fullWidth label="Regione/Provincia *" name="provincia" value={formData.provincia} onChange={handleChange} error={!!fieldErrors.provincia} InputLabelProps={{ shrink: true }} />
                                    )}
                                </Grid>

                                {/* --- COMUNE --- */}
                                <Grid item xs={12} sm={3}>
                                    {formData.statoAppartenenza === 'Italia' ? (
                                        <TextField select fullWidth label="Comune *" name="comune" value={formData.comune} onChange={handleChange} disabled={!formData.provincia} error={!!fieldErrors.comune} InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '56px' }, MenuProps: { style: { maxHeight: 300 } } }}>
                                            <MenuItem disabled value=""><em>Seleziona</em></MenuItem>
                                            {comuniOpzioni.map(c => <MenuItem key={c.codice} value={c.nome}>{c.nome}</MenuItem>)}
                                        </TextField>
                                    ) : (
                                        <TextField fullWidth label="Città *" name="comune" value={formData.comune} onChange={handleChange} error={!!fieldErrors.comune} InputLabelProps={{ shrink: true }} />
                                    )}
                                </Grid>

                                {/* --- CAP --- */}
                                <Grid item xs={12} sm={3}>
                                    {formData.statoAppartenenza === 'Italia' ? (
                                        capOpzioni.length > 1 ? (
                                            <TextField select fullWidth label="CAP *" name="cap" value={formData.cap} onChange={handleChange} error={!!fieldErrors.cap} InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '56px' } }}>
                                                <MenuItem disabled value=""><em>Seleziona CAP</em></MenuItem>
                                                {capOpzioni.map(cap => <MenuItem key={cap} value={cap}>{cap}</MenuItem>)}
                                            </TextField>
                                        ) : (
                                            <TextField fullWidth label="CAP *" name="cap" value={formData.cap} onChange={handleChange} disabled={capOpzioni.length === 1 && !!formData.comune} error={!!fieldErrors.cap} InputLabelProps={{ shrink: true }} />
                                        )
                                    ) : (
                                        <TextField fullWidth label="Zip Code *" name="cap" value={formData.cap} onChange={handleChange} error={!!fieldErrors.cap} InputLabelProps={{ shrink: true }} />
                                    )}
                                </Grid>

                            </Grid>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="h5" color="primary" gutterBottom>Recapiti</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}><TextField fullWidth label="Cellulare" name="cellulare" value={formData.cellulare} onChange={handleChange} error={!!fieldErrors.cellulare} helperText={fieldErrors.cellulare ? "Inserire 9/10 cifre" : ""} /></Grid>
                                <Grid item xs={12} sm={4}><TextField fullWidth label="Telefono Fisso" name="telefonoFisso" value={formData.telefonoFisso} onChange={handleChange} error={!!fieldErrors.telefonoFisso} helperText={fieldErrors.telefonoFisso ? "Es. 06123456" : ""} /></Grid>
                                <Grid item xs={12} sm={4}><TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={!!fieldErrors.email} helperText={fieldErrors.email ? "Formato non valido" : ""} /></Grid>
                            </Grid>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="h5" color="primary" gutterBottom>Altre Informazioni</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Note aggiuntive" name="note" value={formData.note} onChange={handleChange} placeholder="Inserisci richieste o comunicazioni per il medico..." /></Grid>
                            </Grid>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 3, border: fieldErrors.consensoPrivacy ? '1px solid red' : '1px solid #ffcdd2', borderRadius: 2, bgcolor: '#fffefe' }}>
                            <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 'bold' }}>* I campi contrassegnati da asterisco e almeno un recapito sono obbligatori.</Typography>
                            <FormControlLabel control={<Checkbox checked={formData.consensoPrivacy} onChange={handleChange} name="consensoPrivacy" sx={{ color: fieldErrors.consensoPrivacy ? 'red' : 'primary' }} />} label={<Typography color={fieldErrors.consensoPrivacy ? 'error' : 'inherit'}>Acconsento al trattamento dei dati personali per le finalità mediche previste. *</Typography>} />
                        </Paper>
                    </Box>
                );
            case 3:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={7}>
                            <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e0e0e0', height: '100%' }}>
                                <Typography variant="h4" color="primary" gutterBottom>Dati della Prenotazione</Typography>
                                <Typography variant="h6" sx={{ mt: 3 }}>La tua Visita:</Typography>
                                <Typography variant="body1"><b>Sede:</b> {getSedeNome()}</Typography>
                                <Typography variant="body1"><b>Prestazione:</b> {getPrestazioneNome()} ({formData.specializzazione})</Typography>
                                <Typography variant="body1"><b>Medico:</b> {getMedicoNome()}</Typography>
                                <Typography variant="body1"><b>Data e Ora:</b> {formData.dataVisita} alle {formData.oraVisita}</Typography>
                                <Typography variant="h6" sx={{ mt: 3 }}>I tuoi Dati:</Typography>
                                <Typography variant="body1"><b>Paziente:</b> {formData.nome} {formData.cognome} (CF: {formData.codiceFiscale})</Typography>
                                <Typography variant="body1"><b>Residenza:</b> {formData.indirizzo}, {formData.comune} ({formData.provincia}) - {formData.cap} [{formData.statoAppartenenza}]</Typography>
                                <Typography variant="body1"><b>Recapiti:</b> {[formData.cellulare, formData.telefonoFisso, formData.email].filter(Boolean).join(' - ')}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Box sx={{ p: 4, bgcolor: '#e8f5e9', borderRadius: 2, border: '1px solid #c8e6c9', height: '100%' }}>
                                <Typography variant="h4" color="success.main" gutterBottom>Riepilogo Costi</Typography>
                                <Grid container justifyContent="space-between" sx={{ mt: 4, mb: 2 }}><Typography>Costo Prestazione Medica:</Typography><Typography>€ {prezzoSelezionato.toFixed(2)}</Typography></Grid>
                                <Grid container justifyContent="space-between" sx={{ mb: 3 }}><Typography>Imposta di bollo:</Typography><Typography>€ 2.00</Typography></Grid>
                                <Divider sx={{ my: 3, borderColor: '#81c784' }} />
                                <Grid container justifyContent="space-between"><Typography variant="h3" color="success.main">Totale da Pagare:</Typography><Typography variant="h3" color="success.main">€ {(prezzoSelezionato + 2).toFixed(2)}</Typography></Grid>
                            </Box>
                        </Grid>
                    </Grid>
                );
            default: return 'Step sconosciuto';
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h3" gutterBottom>Prenotazione Visita Specialistica</Typography>
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5, mt: 4 }}>
                    {steps.map((label) => ( <Step key={label}><StepLabel>{label}</StepLabel></Step> ))}
                </Stepper>
                {errorMsg && <Alert severity="error" sx={{ mb: 4 }}>{errorMsg}</Alert>}
                <Box sx={{ mt: 2, mb: 4 }}>{renderStepContent(activeStep)}</Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 3, borderTop: '1px solid #e0e0e0' }}>
                    <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }} variant="outlined">Indietro</Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    {activeStep === steps.length - 1 ? (
                        <Button onClick={handleSubmit} variant="contained" color="success" size="large">Conferma Prenotazione</Button>
                    ) : (
                        <Button onClick={handleNext} variant="contained" size="large">Avanti</Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default PrenotazioniWizard;