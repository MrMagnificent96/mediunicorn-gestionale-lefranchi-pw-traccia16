package com.lefranchi.projectworkertraccia16.repository;

import com.lefranchi.projectworkertraccia16.model.Allegato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllegatoRepository extends JpaRepository<Allegato, Long> {
    // Trova tutti gli allegati di uno specifico referto
    List<Allegato> findByRefertoId(Long refertoId);
}
