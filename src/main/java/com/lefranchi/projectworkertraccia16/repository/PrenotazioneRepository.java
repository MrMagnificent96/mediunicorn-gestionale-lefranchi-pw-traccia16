package com.lefranchi.projectworkertraccia16.repository;

import com.lefranchi.projectworkertraccia16.model.Prenotazione;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PrenotazioneRepository extends JpaRepository<Prenotazione, Long> {
    // --- NUOVE QUERY PER LA DASHBOARD CON FILTRO TEMPORALE ---
    @Query("SELECT COALESCE(SUM(p.prezzoFinale), 0) FROM Prenotazione p WHERE p.stato = 'COMPLETATA' AND p.dataOra >= :inizio AND p.dataOra <= :fine")
    Double calcolaIncassoTotaleByDate(@Param("inizio") LocalDateTime inizio, @Param("fine") LocalDateTime fine);

    @Query("SELECT COUNT(p) FROM Prenotazione p WHERE p.stato = 'DA_REFERTARE' AND p.dataOra >= :inizio AND p.dataOra <= :fine")
    Long contaVisiteInSospesoByDate(@Param("inizio") LocalDateTime inizio, @Param("fine") LocalDateTime fine);

    @Query("SELECT COUNT(p) FROM Prenotazione p WHERE p.dataOra >= :inizio AND p.dataOra <= :fine")
    Long countByDate(@Param("inizio") LocalDateTime inizio, @Param("fine") LocalDateTime fine);

    // Trova tutte le prenotazioni in un intervallo di tempo (es. un'intera giornata)
    List<Prenotazione> findByDataOraBetween(LocalDateTime inizio, LocalDateTime fine);

    // Per trovare le visite in attesa di referto
    List<Prenotazione> findByStato(String stato);

    // Calcola l'incasso totale delle visite completate
    @Query("SELECT COALESCE(SUM(p.prezzoFinale), 0) FROM Prenotazione p WHERE p.stato = 'COMPLETATA'")
    Double calcolaIncassoTotale();

    // Conta le visite ancora da refertare
    @Query("SELECT COUNT(p) FROM Prenotazione p WHERE p.stato = 'DA_REFERTARE'")
    Long contaVisiteInSospeso();

    // Aggiungi questo metodo nel tuo PrenotazioneRepository
    @Query("SELECT COUNT(p) FROM Prenotazione p WHERE p.sede.id = :sedeId AND p.prestazione.id = :prestazioneId AND p.medico.id = :medicoId AND p.dataOra = :dataOra AND p.id != :prenotazioneId")
    Long contaConflittiModifica(Long sedeId, Long prestazioneId, Long medicoId, java.time.LocalDateTime dataOra, Long prenotazioneId);
}