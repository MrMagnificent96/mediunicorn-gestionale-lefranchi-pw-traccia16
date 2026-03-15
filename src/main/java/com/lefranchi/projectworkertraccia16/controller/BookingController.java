package com.lefranchi.projectworkertraccia16.controller;

import com.lefranchi.projectworkertraccia16.dto.PrenotazioneRequest;
import com.lefranchi.projectworkertraccia16.model.Medico;
import com.lefranchi.projectworkertraccia16.model.Prenotazione;
import com.lefranchi.projectworkertraccia16.model.Prestazione;
import com.lefranchi.projectworkertraccia16.model.Sede;
import com.lefranchi.projectworkertraccia16.repository.MedicoRepository;
import com.lefranchi.projectworkertraccia16.repository.PrenotazioneRepository;
import com.lefranchi.projectworkertraccia16.repository.PrestazioneRepository;
import com.lefranchi.projectworkertraccia16.repository.SedeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/booking")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    @Autowired private SedeRepository sedeRepository;
    @Autowired private PrestazioneRepository prestazioneRepository;
    @Autowired private MedicoRepository medicoRepository;
    @Autowired private PrenotazioneRepository prenotazioneRepository;

    // STEP 1: Elenco delle Sedi
    @GetMapping("/sedi")
    public List<Sede> getSedi() {
        return sedeRepository.findAll();
    }

    // STEP 2: Elenco delle Specializzazioni uniche
    @GetMapping("/specializzazioni")
    public List<String> getSpecializzazioni() {
        return prestazioneRepository.findDistinctSpecializzazioni();
    }

    // STEP 3: Elenco Prestazioni in base alla specializzazione
    @GetMapping("/prestazioni")
    public List<Prestazione> getPrestazioni(@RequestParam String specializzazione) {
        return prestazioneRepository.findBySpecializzazione(specializzazione);
    }

    // STEP 4: Elenco Medici per Specializzazione e Sede
    @GetMapping("/medici")
    public List<Medico> getMedici(@RequestParam String specializzazione, @RequestParam Long sedeId) {
        return medicoRepository.findBySpecializzazioneAndSediOperativeId(specializzazione, sedeId);
    }

    // STEP 5: Calcolo degli Slot Orari liberi
    @GetMapping("/orari-liberi")
    public List<String> getOrariLiberi(@RequestParam String data, @RequestParam(required = false) Long medicoId) {
        LocalDate dataScelta = LocalDate.parse(data);
        LocalDateTime inizioGiornata = dataScelta.atStartOfDay();
        LocalDateTime fineGiornata = dataScelta.atTime(LocalTime.MAX);

        // Recuperiamo tutte le prenotazioni di quel giorno
        List<Prenotazione> occupate = prenotazioneRepository.findByDataOraBetween(inizioGiornata, fineGiornata);

        // Se è stato scelto un medico, filtriamo le prenotazioni solo per lui
        if (medicoId != null) {
            occupate = occupate.stream().filter(p -> p.getMedico().getId().equals(medicoId)).collect(Collectors.toList());
        }

        List<LocalTime> orariOccupati = occupate.stream().map(p -> p.getDataOra().toLocalTime()).collect(Collectors.toList());
        List<String> orariDisponibili = new ArrayList<>();

        // Generiamo gli slot (09:00-13:00 e 14:00-18:00) ogni 30 minuti
        LocalTime[] turni = { LocalTime.of(9,0), LocalTime.of(14,0) };
        for (LocalTime inizioTurno : turni) {
            LocalTime orarioCorrente = inizioTurno;
            for (int i = 0; i < 8; i++) { // 8 slot da 30 min = 4 ore
                if (!orariOccupati.contains(orarioCorrente)) {
                    orariDisponibili.add(orarioCorrente.toString());
                }
                orarioCorrente = orarioCorrente.plusMinutes(30);
            }
        }
        return orariDisponibili;
    }

    // STEP 6: Salvataggio finale e validazioni
    @PostMapping("/prenota")
    public Prenotazione salvaPrenotazione(@RequestBody PrenotazioneRequest request) {

        // Validazione 1: Almeno un contatto obbligatorio
        boolean haCellulare = request.getCellulare() != null && !request.getCellulare().isBlank();
        boolean haFisso = request.getTelefonoFisso() != null && !request.getTelefonoFisso().isBlank();
        boolean haEmail = request.getEmail() != null && !request.getEmail().isBlank();

        if (!haCellulare && !haFisso && !haEmail) {
            throw new RuntimeException("Errore di validazione: È obbligatorio inserire almeno un recapito (Cellulare, Telefono Fisso o Email).");
        }

        Sede sede = sedeRepository.findById(request.getSedeId()).orElseThrow();
        Prestazione prestazione = prestazioneRepository.findById(request.getPrestazioneId()).orElseThrow();
        Medico medicoAssegnato;

        // Assegnazione Casuale del Medico se l'utente non ha preferenze
        if (request.getMedicoId() == null) {
            List<Medico> mediciDisponibili = medicoRepository.findBySpecializzazioneAndSediOperativeId(
                    prestazione.getSpecializzazione(), sede.getId());
            if (mediciDisponibili.isEmpty()) {
                throw new RuntimeException("Nessun medico disponibile per questa specializzazione in questa sede.");
            }
            Random random = new Random();
            medicoAssegnato = mediciDisponibili.get(random.nextInt(mediciDisponibili.size()));
        } else {
            medicoAssegnato = medicoRepository.findById(request.getMedicoId()).orElseThrow();
        }

        // Creazione dell'entità
        Prenotazione p = new Prenotazione();
        p.setDataOra(LocalDateTime.of(request.getDataVisita(), request.getOraVisita()));
        p.setStato("DA_REFERTARE");
        p.setPrezzoFinale(prestazione.getPrezzo() + 2.00); // Prezzo prestazione + 2€ Marca da Bollo
        p.setSede(sede);
        p.setPrestazione(prestazione);
        p.setMedico(medicoAssegnato);

        // Copia dei dati anagrafici
        p.setNome(request.getNome());
        p.setCognome(request.getCognome());
        p.setDataNascita(request.getDataNascita());
        p.setCodiceFiscale(request.getCodiceFiscale());
        p.setIndirizzo(request.getIndirizzo());
        p.setStatoAppartenenza(request.getStatoAppartenenza());
        p.setProvincia(request.getProvincia());
        p.setComune(request.getComune());
        p.setCap(request.getCap());
        p.setCellulare(request.getCellulare());
        p.setTelefonoFisso(request.getTelefonoFisso());
        p.setEmail(request.getEmail());
        p.setNote(request.getNote());
        p.setConsensoPrivacy(request.getConsensoPrivacy());

        return prenotazioneRepository.save(p);
    }

    // --- 1. LETTURA DI TUTTE LE PRENOTAZIONI ---
    @GetMapping("/all")
    public List<Prenotazione> getAllPrenotazioni() {
        // Le ordiniamo per data decrescente così le più recenti sono in alto
        return prenotazioneRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "dataOra"));
    }

    // --- 2. ELIMINAZIONE PRENOTAZIONE ---
    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> eliminaPrenotazione(@PathVariable Long id) {
        Prenotazione p = prenotazioneRepository.findById(id).orElseThrow();

        // REGOLA DI BUSINESS: Non si può eliminare una visita già fatta
        if ("COMPLETATA".equals(p.getStato())) {
            return org.springframework.http.ResponseEntity.badRequest().body("Impossibile eliminare una prenotazione già completata e refertata.");
        }

        prenotazioneRepository.delete(p);
        return org.springframework.http.ResponseEntity.ok().build();
    }

    // --- 3. MODIFICA COMPLETA PRENOTAZIONE ---
    @PutMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> modificaPrenotazione(@PathVariable Long id, @RequestBody PrenotazioneRequest request) {
        Prenotazione p = prenotazioneRepository.findById(id).orElseThrow();

        if ("COMPLETATA".equals(p.getStato())) {
            return org.springframework.http.ResponseEntity.badRequest().body("Impossibile modificare una prenotazione già completata.");
        }

        LocalDateTime nuovaDataOra = LocalDateTime.of(request.getDataVisita(), request.getOraVisita());

        // CONTROLLO CONFLITTI: Verifichiamo che il nuovo slot non sia occupato
        Long conflitti = prenotazioneRepository.contaConflittiModifica(
                p.getSede().getId(), p.getPrestazione().getId(), p.getMedico().getId(), nuovaDataOra, id);

        if (conflitti > 0) {
            return org.springframework.http.ResponseEntity.badRequest().body("Errore: Questo slot orario è già occupato per questo medico in questa sede.");
        }

        // 1. Aggiorna Data e Ora
        p.setDataOra(nuovaDataOra);

        // 2. Aggiorna Dati Paziente
        p.setNome(request.getNome());
        p.setCognome(request.getCognome());
        p.setCodiceFiscale(request.getCodiceFiscale());
        p.setDataNascita(request.getDataNascita());

        // 3. Aggiorna Residenza e Recapiti
        p.setIndirizzo(request.getIndirizzo());
        p.setComune(request.getComune());
        p.setProvincia(request.getProvincia());
        p.setCap(request.getCap());
        p.setStatoAppartenenza(request.getStatoAppartenenza());
        p.setCellulare(request.getCellulare());
        p.setTelefonoFisso(request.getTelefonoFisso());
        p.setEmail(request.getEmail());
        p.setNote(request.getNote());

        prenotazioneRepository.save(p);

        return org.springframework.http.ResponseEntity.ok(p);
    }
}
