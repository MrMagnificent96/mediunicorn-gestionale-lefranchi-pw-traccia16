package com.lefranchi.projectworkertraccia16.repository;

import com.lefranchi.projectworkertraccia16.model.Sede;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SedeRepository extends JpaRepository<Sede, Long> {
}
