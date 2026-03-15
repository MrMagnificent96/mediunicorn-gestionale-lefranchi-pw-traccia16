package com.lefranchi.projectworkertraccia16.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "medici")
public class Medico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String nome;

    @Column(nullable = false, length = 50)
    private String cognome;

    @Column(nullable = false)
    private String specializzazione; // Questa dovrà combaciare con quella in Prestazione

    // Un medico può lavorare in più sedi, e una sede ha più medici
    @ManyToMany
    @JoinTable(
            name = "medici_sedi",
            joinColumns = @JoinColumn(name = "medico_id"),
            inverseJoinColumns = @JoinColumn(name = "sede_id")
    )
    private List<Sede> sediOperative;

    public Medico() {}

    // --- GETTER E SETTER ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCognome() { return cognome; }
    public void setCognome(String cognome) { this.cognome = cognome; }

    public String getSpecializzazione() { return specializzazione; }
    public void setSpecializzazione(String specializzazione) { this.specializzazione = specializzazione; }

    public List<Sede> getSediOperative() { return sediOperative; }
    public void setSediOperative(List<Sede> sediOperative) { this.sediOperative = sediOperative; }
}
