import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Divider, Alert, Box, List, ListItem, ListItemIcon, ListItemText, CircularProgress } from '@mui/material';
import { IconEdit, IconTrash, IconFileDescription, IconDownload } from '@tabler/icons-react';

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

const ListaPrenotazioni = () => {
    const [prenotazioni, setPrenotazioni] = useState([]);
    const [sedi, setSedi] = useState([]);
    const [mediciFiltro, setMediciFiltro] = useState([]);

    const [filtri, setFiltri] = useState({
        codiceFiscale: '', dataDa: '', dataA: '', oraDa: '', oraA: '', sede: '', medico: '', stato: ''
    });

    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [editModal, setEditModal] = useState({
        open: false, id: null, originalDataOra: '', dataVisita: '', oraVisita: '', medicoId: '',
        nome: '', cognome: '', codiceFiscale: '', dataNascita: '',
        indirizzo: '', comune: '', provincia: '', cap: '', statoAppartenenza: '',
        cellulare: '', telefonoFisso: '', email: '', note: ''
    });

    const [refertoModal, setRefertoModal] = useState({ open: false, loading: false, data: null });
    const [orariLiberi, setOrariLiberi] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});
    const [errorMsg, setErrorMsg] = useState('');

    // --- STATI PER ANAGRAFICA ITALIANA ---
    const [datiItalia, setDatiItalia] = useState([]);
    const [province, setProvince] = useState([]);
    const [comuniOpzioni, setComuniOpzioni] = useState([]);
    const [capOpzioni, setCapOpzioni] = useState([]);

    const oggiStr = new Date().toISOString().split('T')[0];

    const caricaDati = () => {
        fetch('http://localhost:8080/api/booking/all')
            .then(res => res.json())
            .then(data => {
                setPrenotazioni(data);
                const mediciUnici = [];
                const mappaMedici = new Map();
                for (const item of data) {
                    if (!mappaMedici.has(item.medico.id)) {
                        mappaMedici.set(item.medico.id, true);
                        mediciUnici.push(item.medico);
                    }
                }
                setMediciFiltro(mediciUnici);
            })
            .catch(err => console.error("Errore di rete", err));

        fetch('http://localhost:8080/api/booking/sedi').then(res => res.json()).then(data => setSedi(data));
    };

    useEffect(() => {
        caricaDati();

        // FETCH DATI ITALIA ALL'AVVIO
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

    // --- LOGICA DI FILTRO E ORDINAMENTO ---
    const prenotazioniFiltrate = prenotazioni
        .filter(p => {
            // ... mantieni la logica di filter esistente ...
            const dataStr = p.dataOra.split('T')[0];
            const oraStr = p.dataOra.split('T')[1].substring(0, 5);
            const matchCF = filtri.codiceFiscale ? p.codiceFiscale.toLowerCase().startsWith(filtri.codiceFiscale.toLowerCase()) : true;
            const matchDataDa = filtri.dataDa ? dataStr >= filtri.dataDa : true;
            const matchDataA = filtri.dataA ? dataStr <= filtri.dataA : true;
            const matchOraDa = filtri.oraDa ? oraStr >= filtri.oraDa : true;
            const matchOraA = filtri.oraA ? oraStr <= filtri.oraA : true;
            const matchSede = filtri.sede ? p.sede.id === filtri.sede : true;
            const matchMedico = filtri.medico ? p.medico.id === filtri.medico : true;
            const matchStato = filtri.stato ? p.stato === filtri.stato : true;
            return matchCF && matchDataDa && matchDataA && matchOraDa && matchOraA && matchSede && matchMedico && matchStato;
        })
        .sort((a, b) => {
            // 1. DATA E ORA (Decrescente: le più recenti/lontane nel futuro in alto)
            const dataA = new Date(a.dataOra);
            const dataB = new Date(b.dataOra);
            if (dataA > dataB) return -1; // Invertito: -1 se A è più grande
            if (dataA < dataB) return 1;

            // 2. PAZIENTE (Alfabetico: Cognome + Nome)
            const nomeA = `${a.cognome} ${a.nome}`.toLowerCase();
            const nomeB = `${b.cognome} ${b.nome}`.toLowerCase();
            if (nomeA < nomeB) return -1;
            if (nomeA > nomeB) return 1;

            // 3. SEDE (Alfabetico per nome sede)
            const sedeA = a.sede.nome.toLowerCase();
            const sedeB = b.sede.nome.toLowerCase();
            if (sedeA < sedeB) return -1;
            if (sedeA > sedeB) return 1;

            // 4. MEDICO (Alfabetico per cognome medico)
            const medicoA = medicoA.cognome.toLowerCase();
            const medicoB = medicoB.cognome.toLowerCase();
            if (medicoA < medicoB) return -1;
            if (medicoA > medicoB) return 1;

            // 5. STATO
            return a.stato.localeCompare(b.stato);
        });

    const handleFiltroChange = (e) => setFiltri({ ...filtri, [e.target.name]: e.target.value });

    // --- RICOSTRUZIONE TENDINE QUANDO SI APRE UNA MODIFICA ---
    useEffect(() => {
        if (editModal.open && editModal.statoAppartenenza === 'Italia' && editModal.provincia && datiItalia.length > 0) {
            const filtrati = datiItalia.filter(c => c.sigla === editModal.provincia).sort((a, b) => a.nome.localeCompare(b.nome));
            setComuniOpzioni(filtrati);

            if (editModal.comune) {
                const selectedComune = filtrati.find(c => c.nome === editModal.comune);
                if (selectedComune && selectedComune.cap) {
                    setCapOpzioni(selectedComune.cap);
                } else {
                    setCapOpzioni([]);
                }
            } else {
                setCapOpzioni([]);
            }
        } else {
            setComuniOpzioni([]);
            setCapOpzioni([]);
        }
    }, [editModal.open, editModal.statoAppartenenza, editModal.provincia, editModal.comune, datiItalia]);

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = name === 'codiceFiscale' ? value.toUpperCase() : (type === 'checkbox' ? checked : value);

        let updatedData = { ...editModal, [name]: finalValue };

        // Logica a cascata per pulizia campi
        if (name === 'statoAppartenenza' && finalValue !== 'Italia') {
            updatedData.provincia = ''; updatedData.comune = ''; updatedData.cap = '';
        }
        if (name === 'provincia' && editModal.statoAppartenenza === 'Italia') {
            updatedData.comune = ''; updatedData.cap = '';
        }
        if (name === 'comune' && editModal.statoAppartenenza === 'Italia') {
            updatedData.cap = '';
            const selectedComune = comuniOpzioni.find(c => c.nome === finalValue);
            if (selectedComune && selectedComune.cap && selectedComune.cap.length === 1) {
                updatedData.cap = selectedComune.cap[0]; // Autocompilazione
            }
        }

        setEditModal(updatedData);

        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: false }));
        if (['cellulare', 'telefonoFisso', 'email'].includes(name)) {
            setFieldErrors(prev => ({ ...prev, cellulare: false, telefonoFisso: false, email: false }));
        }
    };

    const confermaEliminazione = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/booking/${deleteModal.id}`, { method: 'DELETE' });
            if (res.ok) {
                caricaDati();
                setDeleteModal({ open: false, id: null });
            } else { alert(await res.text()); }
        } catch (err) { alert("Impossibile contattare il server"); }
    };

    const apriModifica = (p) => {
        const dataPart = p.dataOra.split('T')[0];
        const oraPart = p.dataOra.split('T')[1].substring(0, 5);
        setEditModal({
            open: true, id: p.id, originalDataOra: p.dataOra, dataVisita: dataPart, oraVisita: oraPart, medicoId: p.medico.id,
            nome: p.nome, cognome: p.cognome, codiceFiscale: p.codiceFiscale, dataNascita: p.dataNascita,
            indirizzo: p.indirizzo, comune: p.comune, provincia: p.provincia, cap: p.cap, statoAppartenenza: p.statoAppartenenza,
            cellulare: p.cellulare || '', telefonoFisso: p.telefonoFisso || '', email: p.email || '', note: p.note || ''
        });
        setFieldErrors({});
        setErrorMsg('');
    };

    const apriReferto = async (prenotazioneId) => {
        setRefertoModal({ open: true, loading: true, data: null });
        try {
            const res = await fetch(`http://localhost:8080/api/referti/prenotazione/${prenotazioneId}`);
            if (res.ok) {
                const data = await res.json();
                setRefertoModal({ open: true, loading: false, data: data });
            } else {
                alert("Errore durante il recupero del referto.");
                setRefertoModal({ open: false, loading: false, data: null });
            }
        } catch (err) {
            alert("Impossibile contattare il server.");
            setRefertoModal({ open: false, loading: false, data: null });
        }
    };

    const scaricaFile = async (idFile, nomeFile) => {
        try {
            const res = await fetch(`http://localhost:8080/api/referti/allegato/${idFile}`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = nomeFile;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else { alert("Errore durante il download del file."); }
        } catch (error) { alert("Impossibile scaricare il file dal server."); }
    };

    useEffect(() => {
        if (editModal.dataVisita && editModal.open) {
            fetch(`http://localhost:8080/api/booking/orari-liberi?data=${editModal.dataVisita}&medicoId=${editModal.medicoId}`)
                .then(res => res.json())
                .then(data => {
                    let orariFiltrati = data;
                    if (editModal.dataVisita === oggiStr) {
                        const oraAttuale = new Date();
                        const hAttuale = oraAttuale.getHours();
                        const mAttuale = oraAttuale.getMinutes();
                        orariFiltrati = data.filter(orario => {
                            const [h, m] = orario.split(':').map(Number);
                            return h > hAttuale || (h === hAttuale && m > mAttuale);
                        });
                    }
                    if (editModal.oraVisita && !orariFiltrati.includes(editModal.oraVisita)) {
                        orariFiltrati.push(editModal.oraVisita);
                    }
                    setOrariLiberi(orariFiltrati.sort());
                });
        }
    }, [editModal.dataVisita, editModal.open, editModal.medicoId, oggiStr]);

    const salvaModifica = async () => {
        setErrorMsg('');
        let errors = {};
        let isValid = true;
        let customErrorMsg = '';

        const requiredFields = ['dataVisita', 'oraVisita', 'nome', 'cognome', 'dataNascita', 'codiceFiscale', 'indirizzo', 'statoAppartenenza', 'provincia', 'comune', 'cap'];
        requiredFields.forEach(field => { if (!editModal[field]) errors[field] = true; });

        if (Object.keys(errors).length > 0) {
            isValid = false; customErrorMsg = 'I campi evidenziati in rosso sono obbligatori e non possono essere lasciati vuoti.';
        }

        if (editModal.dataVisita && editModal.oraVisita) {
            const dataSelezionata = new Date(`${editModal.dataVisita}T${editModal.oraVisita}`);
            const dataOriginale = new Date(editModal.originalDataOra);
            const adesso = new Date();
            if (dataSelezionata <= adesso && dataSelezionata.getTime() !== dataOriginale.getTime()) {
                errors.dataVisita = true; errors.oraVisita = true; isValid = false;
                customErrorMsg = 'Attenzione: non puoi spostare l\'appuntamento a una data o ora già trascorsa.';
            }
        }

        if (!editModal.cellulare && !editModal.telefonoFisso && !editModal.email) {
            errors.cellulare = true; errors.telefonoFisso = true; errors.email = true;
            isValid = false; customErrorMsg = 'È obbligatorio inserire almeno un recapito valido.';
        } else {
            if (!validaEmail(editModal.email)) { errors.email = true; isValid = false; customErrorMsg = "Formato Email non valido."; }
            if (!validaCellulare(editModal.cellulare)) { errors.cellulare = true; isValid = false; customErrorMsg = "Cellulare deve contenere 9/10 cifre."; }
            if (!validaTelefonoFisso(editModal.telefonoFisso)) { errors.telefonoFisso = true; isValid = false; customErrorMsg = "Telefono Fisso non valido."; }
        }

        if (editModal.codiceFiscale && !validaCodiceFiscale(editModal.codiceFiscale)) {
            errors.codiceFiscale = true; isValid = false; customErrorMsg = 'Il Codice Fiscale inserito non risulta valido.';
        }

        setFieldErrors(errors);
        if (!isValid) { setErrorMsg(customErrorMsg); return; }

        try {
            const res = await fetch(`http://localhost:8080/api/booking/${editModal.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editModal)
            });
            if (res.ok) {
                caricaDati();
                setEditModal({ open: false, id: null });
            } else { setErrorMsg(await res.text()); }
        } catch (err) { setErrorMsg("Errore di connessione: Impossibile contattare il server."); }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h3" gutterBottom>Gestione Prenotazioni</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Visualizza, filtra e gestisci tutte le prenotazioni a sistema.
                </Typography>

                {/* BARRA DEI FILTRI */}
                <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}><TextField fullWidth label="Codice Fiscale" name="codiceFiscale" value={filtri.codiceFiscale} onChange={handleFiltroChange} size="small" /></Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField select fullWidth label="Sede" name="sede" value={filtri.sede} onChange={handleFiltroChange} size="small" InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '40px' } }}>
                                <MenuItem value=""><em>Tutte le sedi</em></MenuItem>
                                {sedi.map(s => <MenuItem key={s.id} value={s.id}>{s.nome}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField select fullWidth label="Medico" name="medico" value={filtri.medico} onChange={handleFiltroChange} size="small" InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '40px' } }}>
                                <MenuItem value=""><em>Tutti i medici</em></MenuItem>
                                {mediciFiltro.map(m => <MenuItem key={m.id} value={m.id}>Dr. {m.cognome} {m.nome}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField select fullWidth label="Stato" name="stato" value={filtri.stato} onChange={handleFiltroChange} size="small" InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '40px' } }}>
                                <MenuItem value=""><em>Tutti gli stati</em></MenuItem>
                                <MenuItem value="DA_REFERTARE">In Attesa</MenuItem>
                                <MenuItem value="COMPLETATA">Completata</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={3}><TextField fullWidth type="date" label="Data (Da)" name="dataDa" value={filtri.dataDa} onChange={handleFiltroChange} size="small" InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={3}><TextField fullWidth type="date" label="Data (A)" name="dataA" value={filtri.dataA} onChange={handleFiltroChange} size="small" InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={3}><TextField fullWidth type="time" label="Ora (Da)" name="oraDa" value={filtri.oraDa} onChange={handleFiltroChange} size="small" InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={3}><TextField fullWidth type="time" label="Ora (A)" name="oraA" value={filtri.oraA} onChange={handleFiltroChange} size="small" InputLabelProps={{ shrink: true }} /></Grid>
                    </Grid>
                </Paper>

                {/* TABELLA DATI */}
                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead sx={{ bgcolor: '#eeeeee' }}>
                            <TableRow>
                                <TableCell><b>Data e Ora</b></TableCell>
                                <TableCell><b>Paziente (CF)</b></TableCell>
                                <TableCell><b>Sede e Prestazione</b></TableCell>
                                <TableCell><b>Medico</b></TableCell>
                                <TableCell><b>Stato</b></TableCell>
                                <TableCell align="center"><b>Azioni</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {prenotazioniFiltrate.length === 0 ? (
                                <TableRow><TableCell colSpan={6} align="center">Nessuna prenotazione trovata.</TableCell></TableRow>
                            ) : (
                                prenotazioniFiltrate.map((p) => {
                                    const dataIta = new Date(p.dataOra).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
                                    const isInAttesa = p.stato === 'DA_REFERTARE';

                                    return (
                                        <TableRow key={p.id} hover>
                                            <TableCell>{dataIta}</TableCell>
                                            <TableCell>{p.nome} {p.cognome}<br/><Typography variant="caption" color="textSecondary">{p.codiceFiscale}</Typography></TableCell>
                                            <TableCell>{p.sede.nome}<br/><Typography variant="caption" color="textSecondary">{p.prestazione.nomeVisita}</Typography></TableCell>
                                            <TableCell>Dr. {p.medico.cognome}</TableCell>
                                            <TableCell>
                                                <Chip label={isInAttesa ? 'IN ATTESA' : 'COMPLETATA'} color={isInAttesa ? 'warning' : 'success'} size="small" />
                                            </TableCell>
                                            <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                                                <IconButton color="info" disabled={isInAttesa} onClick={() => apriReferto(p.id)} title={isInAttesa ? "Referto non ancora emesso" : "Visualizza Diagnosi e Allegati"}>
                                                    <IconFileDescription size={20} />
                                                </IconButton>
                                                <IconButton color="primary" disabled={!isInAttesa} onClick={() => apriModifica(p)} title={!isInAttesa ? "Non modificabile" : "Modifica Visita"}>
                                                    <IconEdit size={20} />
                                                </IconButton>
                                                <IconButton color="error" disabled={!isInAttesa} onClick={() => setDeleteModal({ open: true, id: p.id })} title={!isInAttesa ? "Non eliminabile" : "Elimina"}>
                                                    <IconTrash size={20} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* MODALE 1: CONFERMA ELIMINAZIONE */}
                <Dialog open={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })}>
                    <DialogTitle>Conferma Eliminazione</DialogTitle>
                    <DialogContent>Sei sicuro di voler annullare e cancellare definitivamente questa prenotazione? L'operazione non è reversibile.</DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteModal({ open: false, id: null })} color="inherit">Annulla</Button>
                        <Button onClick={confermaEliminazione} color="error" variant="contained">Sì, Elimina</Button>
                    </DialogActions>
                </Dialog>

                {/* MODALE 2: MODIFICA COMPLETA */}
                <Dialog open={editModal.open} onClose={() => setEditModal({ open: false, id: null })} fullWidth maxWidth="md">
                    <DialogTitle sx={{ pb: 1 }}>Modifica Dettagli Prenotazione</DialogTitle>
                    <DialogContent dividers sx={{ bgcolor: '#f8fafc', p: 3 }}>
                        {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
                        <Box>
                            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#ffffff' }}>
                                <Typography variant="h5" color="primary" gutterBottom>Data e Ora Appuntamento</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth type="date" label="Data Appuntamento *" name="dataVisita" value={editModal.dataVisita} onChange={handleEditChange} error={!!fieldErrors.dataVisita} InputLabelProps={{ shrink: true }} inputProps={{ min: oggiStr }} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField select fullWidth label="Orario Appuntamento *" name="oraVisita" value={editModal.oraVisita} onChange={handleEditChange} error={!!fieldErrors.oraVisita}>
                                            {orariLiberi.length === 0 ? <MenuItem disabled value="">Nessun orario libero</MenuItem> : orariLiberi.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Paper>
                            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#ffffff' }}>
                                <Typography variant="h5" color="primary" gutterBottom>Dati Anagrafici</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}><TextField fullWidth label="Nome *" name="nome" value={editModal.nome} onChange={handleEditChange} error={!!fieldErrors.nome} /></Grid>
                                    <Grid item xs={12} sm={6}><TextField fullWidth label="Cognome *" name="cognome" value={editModal.cognome} onChange={handleEditChange} error={!!fieldErrors.cognome} /></Grid>
                                    <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Data di Nascita *" name="dataNascita" value={editModal.dataNascita} onChange={handleEditChange} error={!!fieldErrors.dataNascita} InputLabelProps={{ shrink: true }} /></Grid>
                                    <Grid item xs={12} sm={6}><TextField fullWidth label="Codice Fiscale *" name="codiceFiscale" value={editModal.codiceFiscale} onChange={handleEditChange} error={!!fieldErrors.codiceFiscale} inputProps={{ maxLength: 16 }} helperText={fieldErrors.codiceFiscale ? "Formato o carattere di controllo errato" : ""} /></Grid>
                                </Grid>
                            </Paper>
                            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#ffffff' }}>
                                <Typography variant="h5" color="primary" gutterBottom>Residenza</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}><TextField fullWidth label="Indirizzo *" name="indirizzo" value={editModal.indirizzo} onChange={handleEditChange} error={!!fieldErrors.indirizzo} /></Grid>

                                    {/* --- STATO --- */}
                                    <Grid item xs={12} sm={3}>
                                        <TextField select fullWidth label="Stato *" name="statoAppartenenza" value={editModal.statoAppartenenza} onChange={handleEditChange} error={!!fieldErrors.statoAppartenenza} InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '56px' } }}>
                                            <MenuItem value="Italia">Italia</MenuItem>
                                            <MenuItem value="Estero">Estero</MenuItem>
                                        </TextField>
                                    </Grid>

                                    {/* --- PROVINCIA --- */}
                                    <Grid item xs={12} sm={3}>
                                        {editModal.statoAppartenenza === 'Italia' ? (
                                            <TextField select fullWidth label="Provincia *" name="provincia" value={editModal.provincia} onChange={handleEditChange} error={!!fieldErrors.provincia} InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '56px' }, MenuProps: { style: { maxHeight: 300 } } }}>
                                                <MenuItem disabled value=""><em>Seleziona</em></MenuItem>
                                                {province.map(p => <MenuItem key={p.sigla} value={p.sigla}>{p.nome} ({p.sigla})</MenuItem>)}
                                            </TextField>
                                        ) : (
                                            <TextField fullWidth label="Regione/Provincia *" name="provincia" value={editModal.provincia} onChange={handleEditChange} error={!!fieldErrors.provincia} InputLabelProps={{ shrink: true }} />
                                        )}
                                    </Grid>

                                    {/* --- COMUNE --- */}
                                    <Grid item xs={12} sm={3}>
                                        {editModal.statoAppartenenza === 'Italia' ? (
                                            <TextField select fullWidth label="Comune *" name="comune" value={editModal.comune} onChange={handleEditChange} disabled={!editModal.provincia} error={!!fieldErrors.comune} InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '56px' }, MenuProps: { style: { maxHeight: 300 } } }}>
                                                <MenuItem disabled value=""><em>Seleziona</em></MenuItem>
                                                {comuniOpzioni.map(c => <MenuItem key={c.codice} value={c.nome}>{c.nome}</MenuItem>)}
                                            </TextField>
                                        ) : (
                                            <TextField fullWidth label="Città *" name="comune" value={editModal.comune} onChange={handleEditChange} error={!!fieldErrors.comune} InputLabelProps={{ shrink: true }} />
                                        )}
                                    </Grid>

                                    {/* --- CAP --- */}
                                    <Grid item xs={12} sm={3}>
                                        {editModal.statoAppartenenza === 'Italia' ? (
                                            capOpzioni.length > 1 ? (
                                                <TextField select fullWidth label="CAP *" name="cap" value={editModal.cap} onChange={handleEditChange} error={!!fieldErrors.cap} InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true, style: { minHeight: '56px' } }}>
                                                    <MenuItem disabled value=""><em>Seleziona CAP</em></MenuItem>
                                                    {capOpzioni.map(cap => <MenuItem key={cap} value={cap}>{cap}</MenuItem>)}
                                                </TextField>
                                            ) : (
                                                <TextField fullWidth label="CAP *" name="cap" value={editModal.cap} onChange={handleEditChange} disabled={capOpzioni.length === 1 && !!editModal.comune} error={!!fieldErrors.cap} InputLabelProps={{ shrink: true }} />
                                            )
                                        ) : (
                                            <TextField fullWidth label="Zip Code *" name="cap" value={editModal.cap} onChange={handleEditChange} error={!!fieldErrors.cap} InputLabelProps={{ shrink: true }} />
                                        )}
                                    </Grid>

                                </Grid>
                            </Paper>
                            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#ffffff' }}>
                                <Typography variant="h5" color="primary" gutterBottom>Recapiti</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}><TextField fullWidth label="Cellulare" name="cellulare" value={editModal.cellulare} onChange={handleEditChange} error={!!fieldErrors.cellulare} helperText={fieldErrors.cellulare ? "Inserire 9/10 cifre" : ""} /></Grid>
                                    <Grid item xs={12} sm={4}><TextField fullWidth label="Telefono Fisso" name="telefonoFisso" value={editModal.telefonoFisso} onChange={handleEditChange} error={!!fieldErrors.telefonoFisso} helperText={fieldErrors.telefonoFisso ? "Es. 06123456" : ""} /></Grid>
                                    <Grid item xs={12} sm={4}><TextField fullWidth label="Email" name="email" value={editModal.email} onChange={handleEditChange} error={!!fieldErrors.email} helperText={fieldErrors.email ? "Formato non valido" : ""} /></Grid>
                                </Grid>
                            </Paper>
                            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#ffffff' }}>
                                <Typography variant="h5" color="primary" gutterBottom>Altre Informazioni</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Note aggiuntive" name="note" value={editModal.note} onChange={handleEditChange} /></Grid>
                                </Grid>
                            </Paper>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, px: 3, bgcolor: '#ffffff' }}>
                        <Typography variant="body2" color="error" sx={{ fontWeight: 'bold', flexGrow: 1 }}>* I campi con asterisco e almeno un recapito sono obbligatori.</Typography>
                        <Button onClick={() => setEditModal({ open: false, id: null })} color="inherit" variant="outlined" sx={{ mr: 1 }}>Annulla</Button>
                        <Button onClick={salvaModifica} color="primary" variant="contained">Salva Modifiche</Button>
                    </DialogActions>
                </Dialog>

                {/* MODALE 3: LETTURA REFERTO E DOWNLOAD ALLEGATI */}
                <Dialog open={refertoModal.open} onClose={() => setRefertoModal({ open: false, data: null })} fullWidth maxWidth="md">
                    <DialogTitle sx={{ pb: 1, color: '#1976d2' }}>Dettaglio Referto Medico</DialogTitle>
                    <DialogContent dividers sx={{ bgcolor: '#f8fafc', p: 3 }}>
                        {refertoModal.loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                        ) : refertoModal.data ? (
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Emesso in data: {new Date(refertoModal.data.dataEmissione).toLocaleDateString('it-IT')}</Typography>
                                <Paper elevation={0} sx={{ p: 3, mb: 3, mt: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#ffffff' }}>
                                    <Typography variant="h5" color="primary" gutterBottom>Diagnosi e Terapia</Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{refertoModal.data.testoDiagnosi}</Typography>
                                </Paper>
                                {refertoModal.data.allegati && refertoModal.data.allegati.length > 0 && (
                                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#ffffff' }}>
                                        <Typography variant="h5" color="primary" gutterBottom>Documenti Allegati</Typography>
                                        <List dense>
                                            {refertoModal.data.allegati.map((file) => (
                                                <ListItem key={file.id} sx={{ bgcolor: '#f5f5f5', mb: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                                    <ListItemIcon><IconFileDescription size={20} color="#1976d2" /></ListItemIcon>
                                                    <ListItemText primary={file.nomeFile} secondary={file.tipoFile} />
                                                    <Button variant="outlined" size="small" startIcon={<IconDownload />} onClick={() => scaricaFile(file.id, file.nomeFile)}>Scarica</Button>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>
                                )}
                            </Box>
                        ) : <Alert severity="error">Dati del referto non disponibili.</Alert>}
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setRefertoModal({ open: false, data: null })} variant="contained" color="primary">Chiudi Scheda</Button>
                    </DialogActions>
                </Dialog>

            </CardContent>
        </Card>
    );
};

export default ListaPrenotazioni;