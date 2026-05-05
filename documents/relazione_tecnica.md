# Relazione Tecnica / Documentazione del Codice:
## Progetto "Fast Food" — Programmazione Web e Mobile 2025/2026

## 1. Obiettivo del progetto:

L’applicazione realizza una piattaforma **food delivery full-stack** con separazione dei ruoli principali:
- **Cliente**: Registrazione/Login, Consultazione catalogo, Gestione carrello, Invio ordini e storico.
- **Ristoratore**: Gestione ristorante, Menù, Offerte, Monitoraggio ordini.

Il sistema integra:
- Backend REST in **Node.js + Express**;
- Persistenza su **MongoDB**;
- Frontend multi-pagina in **HTML5/CSS3/JavaScript**;
- Autenticazione stateless con **JWT**;
- Validazione e supporto logistico tramite servizi OpenStreetMap (**Nominatim** per geocoding e **OSRM** per routing);
- Documentazione API con **Swagger/OpenAPI**.


## 2. Struttura della repository:

### 2.1 File e directory principali:

- `index.js`: entrypoint del server, bootstrap applicativo e wiring globale.
- `routes/`: endpoint REST suddivisi per dominio (`users`, `meals`, `restaurants`, `carts`, `orders`).
- `middlewares/`: middleware trasversali per autenticazione e autorizzazione.
- `utils/`: utility per configurazione e validazione indirizzi.
- `public/`: pagine e script client-side.
- `documents/`: documentazione tecnica, seed JSON, file Swagger e PDF progettuale.
- `README.md` + `READMEImages/`: descrizione del progetto e risorse grafiche.

### 2.2 Dipendenze e stack (package):

Da `package.json` emergono librerie coerenti con lo stack:
- Server/middleware: `express`, `cors`;
- Database: `mongodb`, `mongoose`;
- Sicurezza/auth: `bcryptjs`, `jsonwebtoken`;
- Documentazione API: `swagger-ui-express`, `swagger-jsdoc`, `swagger-autogen`;
- Utilità sviluppo: `nodemon`.


## 3. Architettura applicativa:

### 3.1 Visione logica:

L’architettura segue un modello a livelli semplificato:
1. **Presentation layer** (frontend statico): pagine HTML che consumano API via `fetch`.
2. **API layer** (Express routes): orchestrazione delle operazioni di dominio.
3. **Service/utility layer** (utils + funzioni locali): validazione, parsing, logica condivisa.
4. **Data layer** (MongoDB): collezioni e documenti JSON/BSON.

### 3.2 Pattern adottati:

- **Router per bounded context**: ogni file in `routes/` isola un’area funzionale.
- **Middleware chain**: autenticazione/autorizzazione riusabili e composte per endpoint.
- **Dependency access tramite `app.locals.db`**: evita import incrociati e semplifica testing/inizializzazione.
- **Error handling centralizzato** (più gestione locale dove utile): garantisce risposte uniformi.


## 4. Backend (Analisi Dettagliata):

### 4.1 `index.js` (Bootstrap Server):

Responsabilità principali:
- Caricamento config/ambiente;
- Connessione a MongoDB e verifica disponibilità;
- Seed idempotente della collezione pasti (`bootstrapInitialMeals`);
- Mount dei router;
- Esposizione Swagger UI;
- Gestione globale degli errori e avvio listener HTTP.

Funzioni di rilievo:
- `normalizeMealDocument(meal)`: converte/normalizza `_id` provenienti da JSON export (es. formato `$oid`), prevenendo inconsistenze all’inserimento;
- `bootstrapInitialMeals(db)`: popola `meals` solo se vuota, evitando duplicazioni.

### 4.2 Middleware di sicurezza:

- `middlewares/authenticateUser.js`: legge `Authorization: Bearer <token>`, verifica JWT, espone payload in `req.user`.
- `middlewares/authorizeRistoratore.js`: applica policy RBAC basilare (`role === "ristoratore"`).

Vantaggi:
- Controller più puliti;
- Enforcement consistente delle regole di accesso;
- Riduzione duplicazione codice di controllo.

### 4.3 Utility di configurazione:

`utils/config.js` implementa:
- Validazione delle variabili ambiente critiche con approccio **fail-fast**;
- Estrazione robusta del nome DB dalla URI (`extractDbNameFromMongoUri`).

### 4.4 Utility geografiche e address quality:

`utils/addressValidation.js` è un modulo chiave per qualità dati:
- Normalizzazione stringhe (accenti, case, spazi);
- Parsing semantico indirizzo (`extractAddressParts`);
- Matching input ↔ `addressdetails` Nominatim (`addressMatches`);
- Orchestrazione richiesta remota con timeout e filtro geografico (`validateAddressWithOpenStreetMap`).


## 5. API REST per dominio:

## 5.1 `routes/users.js`:

Funzionalità tipiche IAM (Identity & Access Management):
- Registrazione con validazioni differenziate per ruolo;
- Login con emissione token;
- Gestione profilo autenticato (`/users/me`);
- Cambio password con hashing bcrypt;
- Cancellazione account.

Aspetti qualitativi:
- Sanificazione campi sensibili e preferenze;
- Controllo univocità su dati identificativi;
- Esclusione password nelle projection di risposta.

## 5.2 `routes/meals.js`:

Gestione catalogo e ownership:
- Listing con filtri compositi (categoria, prezzo, ingredienti, allergeni, area, offerte);
- Dettaglio pasto;
- CRUD piatti da ristoratore proprietario;
- Gestione offerte con regole specifiche (abilitazione/disabilitazione e scontistica).

## 5.3 `routes/restaurants.js`:

Area ristoratore:
- Creazione/aggiornamento profilo attività;
- Gestione menu e contenuti correlati;
- Endpoint per monitoraggio operativo (in base alle implementazioni presenti).

## 5.4 `routes/carts.js`:

Carrello personale con endpoint dedicati:
- Recupero carrello utente autenticato;
- Aggiunta/rimozione item;
- Svuotamento completo.

## 5.5 `routes/orders.js`:

Core del flusso delivery:
- Creazione ordine da carrello/snapshot righe;
- Storico cliente e vista ristoratore;
- Gestione stato ordine con transizioni controllate;
- Stima distanza/tempo via geocoding + routing (con fallback geodetico/haversine).


## 6. Modello dati MongoDB:

### 6.1 Collezioni principali:

- `users`: credenziali hashate, ruolo, anagrafica e preferenze.
- `restaurants`: metadati attività, legame al ristoratore, menu (ObjectId pasti), eventuali offerte.
- `meals`: catalogo base + piatti custom.
- `carts`: documento per utente con items embedded.
- `orders`: snapshot ordine (items, totali, stato, metriche consegna).

### 6.2 Scelte modeling:

- **Embedding** su `carts` e porzioni di `orders`: letture rapide lato checkout/storico.
- **Referencing** tra entità master (`users`, `restaurants`, `meals`): normalizzazione logica e riuso.


## 7. Frontend web:

### 7.1 Pagine e UX:

In `public/` sono presenti pagine dedicate (es. home, login, register, profilo, logout), con separazione dei flussi per ruolo e sessione.

### 7.2 Script client-side:

- Chiamate `fetch` verso backend;
- Rendering dinamico di menu/carrello/ordini;
- Validazioni base lato client;
- Gestione autenticazione in `public/assets/auth.js` (token storage e guard di navigazione role-based).

### 7.3 Stile e responsive:

La UI usa CSS dedicati (`modern-theme.css`, `responsive.css`) e componenti Bootstrap dove opportuno, con obiettivo di coerenza visuale e minore duplicazione stilistica.


## 8. Documentazione API e artefatti:

- `documents/swagger.json`: contratto OpenAPI serializzato.
- `documents/swagger.js`: generazione/aggiornamento documentazione.
- endpoint `/swagger`: interfaccia test/manual exploration API.
- `documents/meals.json`: dataset seed iniziale.
- `documents/PWM__project_25_26.pdf`: documento progettuale correlato.


## 9. Sicurezza, Resilienza e Robustezza:

Misure implementate:
- Hashing password con bcrypt;
- JWT con scadenza configurabile;
- Validazioni input e controllo ObjectId in più endpoint;
- Enforcement ruoli a middleware;
- Timeout su servizi terzi OSM/OSRM;
- Gestione esplicita codici HTTP (`400/401/403/404/409/500`);
- Avvio fail-fast su config mancante/invalida.

Aree migliorabili (roadmap):
- Rate limiting su auth e endpoint sensibili;
- Logging strutturato e correlazione request-id;
- Hardening header HTTP (helmet), CORS più restrittivo in produzione;
- Test automatici unit/integration end-to-end.


## 10. Correttezza REST (Valutazione Critica):

Conformità alta su:
- Naming risorse (`/users`, `/meals`, `/orders`, `/carts`);
- Semantica metodi HTTP;
- Stateless auth via token;
- Uso coerente di status code.

Eccezioni note:
- Endpoint carrello legacy non perfettamente resource-oriented (mantenuti per compatibilità).


## 11. Flussi end-to-end principali:

1. **Onboarding cliente**
   Registrazione → validazione indirizzo OSM → login → token JWT.
2. **Scoperta e scelta pasti**
   Ricerca con filtri → dettaglio pasto → aggiunta carrello.
3. **Checkout e ordine**
   Creazione ordine → calcolo distanza/tempo → stato iniziale `ordinato`.
4. **Gestione operativa ristoratore**
   Presa in carico ordine → avanzamento stati (`in preparazione`, `in consegna`, `consegnato`).
5. **Post-vendita**
   Storico ordini, aggiornamento profilo, gestione menu/offerte.


## 12. Qualità del codice e Manutenibilità:

Punti positivi:
- Separazione funzionale chiara per directory;
- Naming semantico dei moduli;
- Utilità condivise per ridurre duplicazione;
- Presenza di documentazione tecnica e API.

Opportunità:
- Introdurre layer service esplicito per business logic più complessa;
- Aggiungere schema validation centralizzata (es. Joi/Zod);
- Aumentare copertura test e pipeline CI;
- Standardizzare completamente risposta errori (error envelope unico).