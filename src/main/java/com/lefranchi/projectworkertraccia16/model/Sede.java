package com.lefranchi.projectworkertraccia16.model;

import jakarta.persistence.*;

@Entity
@Table(name = "sedi")
public class Sede {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false)
    private String indirizzo;

    public Sede() {}

    public Sede(String nome, String indirizzo) {
        this.nome = nome;
        this.indirizzo = indirizzo;
    }

    // --- GETTER E SETTER ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getIndirizzo() { return indirizzo; }
    public void setIndirizzo(String indirizzo) { this.indirizzo = indirizzo; }
}
