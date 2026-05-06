<img src="public/assets/logo.png" alt="LOGO" width="100"/>
<h1>Progetto di Programmazione Web e Mobile "Fast Food"</h1>
<p><strong>Autore:</strong> Rimoldi Diego</p>

---

## Panoramica

Applicazione web full-stack per la gestione di un sistema di ordinazioni fast food con due ruoli:

- **Cliente**: consultazione menù, gestione carrello, creazione ordini e monitoraggio stato.
- **Ristoratore**: gestione ristorante, menù personalizzato e avanzamento stato ordini.

Il backend espone API REST con **Express + MongoDB**, autenticazione **JWT** e documentazione **Swagger**.

---

## Stack tecnologico

- **Runtime:** Node.js (ES Modules)
- **Backend:** Express
- **Database:** MongoDB (Atlas o istanza locale)
- **Autenticazione:** JSON Web Token (`jsonwebtoken`)
- **Password hashing:** `bcryptjs`
- **Documentazione API:** Swagger UI (`swagger-ui-express`) + generazione specifica (`swagger-autogen`)
- **Utility:** `dotenv`, `cors`, `luxon`

---

## Setup e avvio

### 1) Installazione dipendenze

```bash
npm install
```

### 2) Configurazione variabili ambiente

Crea un file `.env` nella root del progetto con almeno:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB=fastfood
JWT_SECRET=una_chiave_molto_sicura
JWT_EXPIRES_IN=7d
PORT=3000
```

> `MONGODB_DB` è fortemente consigliata: se assente, l'app tenta di dedurre il nome DB da `MONGODB_URI`.

### 3) Avvio server

- Modalità sviluppo:

```bash
npm run dev
```

- Modalità standard:

```bash
npm start
```

App disponibile su: `http://localhost:3000`

---

## Bootstrap dati iniziali

All'avvio, il backend controlla la collection `meals`:

- se **vuota**, carica automaticamente i piatti da `documents/meals.json`;
- se **già popolata**, non inserisce duplicati.

Questo comportamento è implementato in `index.js`.

---

## Documentazione API (Swagger)

- UI Swagger: `http://localhost:3000/swagger`
- Specifica OpenAPI: `documents/swagger.json`

Rigenerazione specifica:

```bash
npm run swagger
```

---

## Struttura repository

```text
┣ 📂documents
┃ ┣ 📜meals.json
┃ ┣ 📜PWM__project_25_26.pdf
┃ ┣ 📜relazione_progettuale.md
┃ ┣ 📜relazione_tecnica.md
┃ ┣ 📜swagger.js
┃ ┗ 📜swagger.json
┣ 📂middlewares
┃ ┣ 📜authenticateUser.js
┃ ┗ 📜authorizeRistoratore.js
┣ 📂public
┃ ┣ 📂assets
┃ ┃ ┗ 📜logo.png
┃ ┣ 📜index.html
┃ ┣ 📜login.html
┃ ┣ 📜logout.html
┃ ┣ 📜profilo.html
┃ ┗ 📜register.html
┣ 📂routes
┃ ┣ 📜carts.js
┃ ┣ 📜meals.js
┃ ┣ 📜orders.js
┃ ┣ 📜restaurants.js
┃ ┗ 📜users.js
┣ 📂utils
┃ ┣ 📜addressValidation.js
┃ ┗ 📜config.js
┣ 📜index.js
┗ 📜package.json
```

---

## Architettura backend

### Entry point

`index.js` si occupa di:

1. connessione MongoDB;
2. registrazione middleware globali (`express.json`, `cors`, static files);
3. bootstrap iniziale piatti;
4. mounting dei router:
   - `/users`
   - `/meals`
   - `/restaurants`
   - `/orders`
   - `/carts`
5. gestione error handler centralizzata.

### Middleware di sicurezza

- `authenticateUser`: verifica presenza/validità JWT e popola `req.user`.
- `authorizeRistoratore`: limita l'accesso agli endpoint riservati ai ristoratori.

---

## Modello dati (MongoDB)

Collection principali:

- `users`: utenti registrati (clienti e ristoratori, distinti dal campo ruolo)
- `restaurants`: ristoranti creati dai ristoratori
- `meals`: piatti generici + piatti personalizzati (con `ristorante_id`)
- `carts`: carrelli utente persistenti
- `orders`: ordini e relativo stato di avanzamento

---

## Flussi applicativi principali

- **Autenticazione**: login con credenziali, emissione JWT, uso token Bearer nelle API protette.
- **Carrello persistente**: salvato su DB per mantenere i dati anche tra sessioni/dispositivi.
- **Ordini multi-ristorante**: smistamento ordini per ristorante.
- **Stati ordine**:
  - ritiro: `ordinato -> in preparazione -> consegnato`
  - consegna: `ordinato -> in preparazione -> in consegna -> consegnato`

---

## Script npm disponibili

```bash
npm start      # Avvio server
npm run dev    # Avvio con nodemon
npm run swagger# Rigenera documents/swagger.json
```

---

## Note utili

- In `package.json` lo script `test` è placeholder e al momento non esegue test automatici.
- Assicurati che l'utente MongoDB abbia i permessi necessari sul database configurato.

---

## Possibili miglioramenti futuri

- Test automatici (unit/integration) per routes e middleware.
- Validazione input più strutturata (es. schema validation centralizzata).
- Logging applicativo strutturato e metriche.
- Containerizzazione con Docker.
- CI/CD con lint + test + deploy automatico.
