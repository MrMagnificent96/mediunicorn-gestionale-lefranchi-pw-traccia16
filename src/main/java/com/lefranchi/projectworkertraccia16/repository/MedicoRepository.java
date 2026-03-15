package com.lefranchi.projectworkertraccia16.repository;

import com.lefranchi.projectworkertraccia16.model.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Long> {
    // Trova i medici per specializzazione e che lavorano in una determinata sede
    List<Medico> findBySpecializzazioneAndSediOperativeId(String specializzazione, Long sedeId);
}