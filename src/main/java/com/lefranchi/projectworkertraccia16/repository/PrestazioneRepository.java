package com.lefranchi.projectworkertraccia16.repository;

import com.lefranchi.projectworkertraccia16.model.Prestazione;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrestazioneRepository extends JpaRepository<Prestazione, Long> {

    // 1. Ci restituisce un elenco di specializzazioni uniche (senza doppioni)
    @Query("SELECT DISTINCT p.specializzazione FROM Prestazione p")
    List<String> findDistinctSpecializzazioni();

    // 2. Dato il nome di una specializzazione, ci restituisce tutte le prestazioni associate
    List<Prestazione> findBySpecializzazione(String specializzazione);
}
