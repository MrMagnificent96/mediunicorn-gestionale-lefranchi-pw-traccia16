package com.lefranchi.projectworkertraccia16.controller;

import com.lefranchi.projectworkertraccia16.model.Allegato;
import com.lefranchi.projectworkertraccia16.model.Prenotazione;
import com.lefranchi.projectworkertraccia16.model.Referto;
import com.lefranchi.projectworkertraccia16.repository.AllegatoRepository;
import com.lefranchi.projectworkertraccia16.repository.PrenotazioneRepository;
import com.lefranchi.projectworkertraccia16.repository.RefertoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional; // <-- IMPORTANTE
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/referti")
@CrossOrigin(origins = "http://localhost:3000")
public class RefertoController {

    @Autowired private RefertoRepository refertoRepository;
    @Autowired private PrenotazioneRepository prenotazioneRepository;
    @Autowired private AllegatoRepository allegatoRepository;

    @GetMapping("/da-refertare")
    public List<Prenotazione> getVisiteDaRefertare() {
        return prenotazioneRepository.findByStato("DA_REFERTARE");
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public Referto creaReferto(
            @RequestParam("prenotazioneId") Long prenotazioneId,
            @RequestParam("testoDiagnosi") String testoDiagnosi,
            @RequestParam(value = "files", required = false) MultipartFile[] files) {

        Prenotazione prenotazione = prenotazioneRepository.findById(prenotazioneId)
                .orElseThrow(() -> new RuntimeException("Prenotazione non trovata"));

        Referto nuovoReferto = new Referto();
        nuovoReferto.setTestoDiagnosi(testoDiagnosi);
        nuovoReferto.setDataEmissione(LocalDate.now());
        nuovoReferto.setPrenotazione(prenotazione);

        Referto refertoSalvato = refertoRepository.save(nuovoReferto);

        if (files != null && files.length > 0) {
            for (MultipartFile file : files) {
                try {
                    Allegato allegato = new Allegato(
                            file.getOriginalFilename(),
                            file.getContentType(),
                            file.getBytes(),
                            refertoSalvato
                    );
                    allegatoRepository.save(allegato);
                } catch (java.io.IOException e) {
                    throw new RuntimeException("Errore salvataggio file");
                }
            }
        }

        prenotazione.setStato("COMPLETATA");
        prenotazioneRepository.save(prenotazione);

        return refertoSalvato;
    }

    // --- LETTURA DEL REFERTO (Con Transazione per Postgres) ---
    @GetMapping("/prenotazione/{prenotazioneId}")
    @Transactional(readOnly = true) // <-- IL FIX! Permette di leggere i LOB in sicurezza
    public org.springframework.http.ResponseEntity<?> getRefertoVisualizzazione(@PathVariable Long prenotazioneId) {
        Referto referto = refertoRepository.findByPrenotazioneId(prenotazioneId)
                .orElseThrow(() -> new RuntimeException("Referto non trovato per questa visita"));

        List<Allegato> allegati = allegatoRepository.findByRefertoId(referto.getId());

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", referto.getId());
        response.put("testoDiagnosi", referto.getTestoDiagnosi());
        response.put("dataEmissione", referto.getDataEmissione());

        List<java.util.Map<String, Object>> allegatiList = new java.util.ArrayList<>();
        for(Allegato a : allegati) {
            java.util.Map<String, Object> all = new java.util.HashMap<>();
            all.put("id", a.getId());
            all.put("nomeFile", a.getNomeFile());
            all.put("tipoFile", a.getTipoFile());
            allegatiList.add(all);
        }
        response.put("allegati", allegatiList);

        return org.springframework.http.ResponseEntity.ok(response);
    }

    // --- DOWNLOAD DEL SINGOLO ALLEGATO (Con Transazione per Postgres) ---
    @GetMapping("/allegato/{id}")
    @Transactional(readOnly = true) // <-- IL FIX! Fondamentale per scaricare i byte[]
    public org.springframework.http.ResponseEntity<byte[]> downloadAllegato(@PathVariable Long id) {
        Allegato allegato = allegatoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Allegato non trovato"));

        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + allegato.getNomeFile() + "\"")
                .contentType(org.springframework.http.MediaType.parseMediaType(allegato.getTipoFile()))
                .body(allegato.getDati());
    }
}
