package com.lefranchi.projectworkertraccia16.controller;

import com.lefranchi.projectworkertraccia16.dto.PrenotazioneRequest;
import com.lefranchi.projectworkertraccia16.model.Medico;
import com.lefranchi.projectworkertraccia16.model.Prenotazione;
import com.lefranchi.projectworkertraccia16.repository.MedicoRepository;
import com.lefranchi.projectworkertraccia16.repository.PrenotazioneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prenotazioni")
@CrossOrigin(origins = "http://localhost:3000")
public class PrenotazioneController {

    @Autowired
    private PrenotazioneRepository prenotazioneRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    // L'endpoint che reagisce quando React invia il modulo tramite metodo POST
    @PostMapping
    public Prenotazione creaPrenotazione(@RequestBody PrenotazioneRequest request) {

        // 2. Recuperiamo il medico dal DB usando l'ID inviato da React
        Medico medicoScelto = medicoRepository.findById(request.getMedicoId())
                .orElseThrow(() -> new RuntimeException("Medico non trovato"));

        // 3. Assembliamo la prenotazione finale
        Prenotazione nuovaPrenotazione = new Prenotazione();
        nuovaPrenotazione.setStato("IN_PROGRAMMA");
        nuovaPrenotazione.setMedico(medicoScelto);

        // 4. Salviamo tutto nel database e restituiamo l'oggetto creato
        return prenotazioneRepository.save(nuovaPrenotazione);
    }

    // Aggiungi questo per permettere a React di leggere tutte le visite
    @GetMapping
    public java.util.List<com.lefranchi.projectworkertraccia16.model.Prenotazione> getTuttePrenotazioni() {
        return prenotazioneRepository.findAll();
    }
}