package com.lefranchi.projectworkertraccia16.repository;

import com.lefranchi.projectworkertraccia16.model.Referto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefertoRepository extends JpaRepository<Referto, Long> {
    // Trova il referto partendo dall'ID della prenotazione
    Optional<Referto> findByPrenotazioneId(Long prenotazioneId);
}
