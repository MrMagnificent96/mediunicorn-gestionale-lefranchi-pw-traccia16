package com.lefranchi.projectworkertraccia16.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        // LOGIN BASICO: Controlliamo se username e password sono "admin"
        if ("admin".equals(username) && "admin".equals(password)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("nome", "Amministratore Clinica");
            response.put("ruolo", "ADMIN");
            return ResponseEntity.ok(response);
        }

        // Se sbagliate, restituiamo un Errore 401 (Non Autorizzato)
        return ResponseEntity.status(401).body("Credenziali non valide");
    }
}
