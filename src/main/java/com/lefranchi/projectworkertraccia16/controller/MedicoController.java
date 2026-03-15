package com.lefranchi.projectworkertraccia16.controller;

import com.lefranchi.projectworkertraccia16.model.Medico;
import com.lefranchi.projectworkertraccia16.repository.MedicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medici")
@CrossOrigin(origins = "http://localhost:3000") // Permette a React di leggere i dati
public class MedicoController {

    @Autowired
    private MedicoRepository medicoRepository;

    // Quando React fa una chiamata GET a /api/medici, Spring Boot esegue questo metodo
    @GetMapping
    public List<Medico> getTuttiMedici() {
        // .findAll() è il metodo magico regalato dal Repository che fa una "SELECT * FROM medici"
        return medicoRepository.findAll();
    }
}
