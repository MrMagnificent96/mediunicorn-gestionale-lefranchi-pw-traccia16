# 🦄 MediUnicorn - Sistema Gestionale Poliambulatori

Progetto sviluppato per il **Project Work (Traccia 16)** del Corso di Laurea in Informatica per le Aziende Digitali (L-31).

## 📌 Descrizione
MediUnicorn è un'applicazione web Full-Stack API-based per la gestione integrata di strutture sanitarie. Il sistema digitalizza le prenotazioni, la refertazione medica e l'analisi dei KPI economici, offrendo un'interfaccia reattiva e un back-end robusto.

## 🛠️ Stack Tecnologico
* **Back-End:** Java 17, Spring Boot 3, Spring Data JPA, API RESTful.
* **Database:** PostgreSQL.
* **Front-End:** React.js, Vite, Material-UI (Berry Template).
* **Integrazioni esterne:** API Dati Territoriali (ISTAT) per Cascading Dropdowns, OpenAI (opzionale).

## 🚀 Come avviare il progetto in locale

### 1. Avvio del Back-End (Spring Boot)
1. Assicurarsi di avere un'istanza di PostgreSQL in esecuzione.
2. Aprire il progetto su IntelliJ IDEA.
3. Aggiornare le credenziali del database (URL, username, password) nel file `src/main/resources/application.properties`.
4. Avviare la classe principale `ProjectWorkerTraccia16Application.java`.
5. *Documentazione API (Swagger):* Accessibile all'indirizzo `http://localhost:8080/swagger-ui/index.html` ad applicativo avviato.

### 2. Avvio del Front-End (React)
### 3. Aprire un terminale posizionato nella cartella `frontend`.
### 4. Installare le dipendenze:
        npm install
### 5. Avviare il server di sviluppo:
        npm run dev
### 6. L'applicazione sarà accessibile all'indirizzo indicato nel terminale (es. http://localhost:5173).
