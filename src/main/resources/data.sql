-- Popoliamo le Sedi
INSERT INTO sedi (nome, indirizzo)
SELECT v.nome, v.indirizzo
FROM (VALUES
          ('Clinica Milano Centro', 'Via Roma 10, Milano'),
          ('Poliambulatorio Roma Est', 'Via Tiburtina 150, Roma')
     ) AS v(nome, indirizzo)
WHERE NOT EXISTS (
    SELECT 1 FROM sedi s WHERE s.nome = v.nome
);

-- Popoliamo le Prestazioni
INSERT INTO prestazioni (specializzazione, nome_visita, prezzo)
SELECT v.specializzazione, v.nome_visita, v.prezzo
FROM (VALUES
          ('Cardiologia', 'Visita Cardiologica di Controllo', 100.00),
          ('Cardiologia', 'Elettrocardiogramma (ECG)', 50.00),
          ('Ortopedia', 'Visita Ortopedica', 120.00),
          ('Dermatologia', 'Mappatura Nei', 80.00)
     ) AS v(specializzazione, nome_visita, prezzo)
WHERE NOT EXISTS (
    SELECT 1
    FROM prestazioni p
    WHERE p.specializzazione = v.specializzazione
      AND p.nome_visita = v.nome_visita
);

-- Popoliamo i Medici
INSERT INTO medici (nome, cognome, specializzazione)
SELECT v.nome, v.cognome, v.specializzazione
FROM (VALUES
          ('Mario', 'Rossi', 'Cardiologia'),
          ('Laura', 'Bianchi', 'Cardiologia'),
          ('Giuseppe', 'Verdi', 'Ortopedia'),
          ('Anna', 'Neri', 'Dermatologia')
     ) AS v(nome, cognome, specializzazione)
WHERE NOT EXISTS (
    SELECT 1
    FROM medici m
    WHERE m.nome = v.nome
      AND m.cognome = v.cognome
);

-- Relazione Medici-Sedi con recupero dinamico degli ID
INSERT INTO medici_sedi (medico_id, sede_id)
SELECT m.id, s.id
FROM (
         VALUES
             ('Mario','Rossi','Clinica Milano Centro'),
             ('Mario','Rossi','Poliambulatorio Roma Est'),
             ('Laura','Bianchi','Clinica Milano Centro'),
             ('Giuseppe','Verdi','Poliambulatorio Roma Est'),
             ('Anna','Neri','Clinica Milano Centro')
     ) AS v(nome, cognome, sede_nome)
         JOIN medici m
              ON m.nome = v.nome
                  AND m.cognome = v.cognome
         JOIN sedi s
              ON s.nome = v.sede_nome
WHERE NOT EXISTS (
    SELECT 1
    FROM medici_sedi ms
    WHERE ms.medico_id = m.id
      AND ms.sede_id = s.id
);