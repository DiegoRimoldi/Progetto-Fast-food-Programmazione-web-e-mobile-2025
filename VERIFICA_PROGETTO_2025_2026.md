# Verifica tecnica progetto FastFood (A.A. 2025/2026)

## Ambito della verifica

Questa verifica copre:

- analisi statica del codice backend/frontend;
- coerenza con i requisiti della traccia (macro-scenari e operazioni);
- smoke-check di avvio applicazione Node.js;
- validazione minima di sintassi sui file JavaScript.

## Esito sintetico

- **Stato generale:** buono per una demo d'esame.
- **Blocchi corretti durante la verifica:**
  1. script di avvio errato in `package.json` (`server.js` inesistente);
  2. controllo autorizzazione difettoso su `GET /orders/:id`;
  3. controllo proprietario difettoso su `DELETE /meals/:id`.
- **Rischi residui non bloccanti per demo:** mancano test automatici (`npm test` non implementato), e non c'è un harness di integrazione end-to-end.

## Copertura requisiti (traccia)

### 1) Gestione profilo utente

- Registrazione/login presenti (`/users/register`, `/users/login`).
- Lettura/modifica profilo presenti (`GET/PUT /users/me`).
- Cambio password presente (`PUT /users/me/password`).
- Cancellazione profilo presente (`DELETE /users/:id`) con cleanup dati associati.

### 2) Gestione ristorante

- CRUD ristorante disponibile (`POST/PUT/DELETE /restaurants`, `GET /restaurants/:id`).
- Associazione 1 ristoratore -> 1 ristorante implementata.
- Gestione menu tramite riferimenti a `meals` implementata.
- Ricerca ristoranti per nome/indirizzo presente (`GET /restaurants/search`).

### 3) Gestione ordini

- Creazione ordine cliente presente (`POST /orders`).
- Stati ordine presenti: `ordinato`, `in preparazione`, `in consegna`, `consegnato`.
- Vista ordini cliente/ristoratore presente (`GET /orders`, `GET /orders/:id`).
- Conferma consegna cliente presente (`PUT /orders/:id/consegna`).

### 4) Gestione consegne

- Flussi distinti ritiro/consegna implementati in aggiornamento stato ordine (`PUT /orders/:id`).
- Conferma finale lato cliente prevista per ordini in consegna.

### Operazioni obbligatorie citate in traccia

- Ricerca ristorante per nome/luogo: **presente**.
- Ricerca piatti per categoria/nome/prezzo: **presente** su `GET /meals`.
- Ricerca ristorante per piatto: **parzialmente coperta** (fattibile componendo chiamate, ma non endpoint dedicato esplicito).
- Ricerca piatti per ingredienti/allergie: **strutturalmente possibile** (campi ingredienti esistono), ma non c'è endpoint esplicito dedicato con semantica allergeni.
- Consegna a domicilio: **presente** nel modello ordini.

## Correzioni applicate in questa verifica

1. **Avvio applicazione corretto**
   - `main` e script `start` ora puntano a `index.js`.
2. **Autorizzazione accesso ordine corretto**
   - `GET /orders/:id` ora valida separatamente cliente e ristoratore, con lookup del ristorante del ristoratore autenticato.
3. **Autorizzazione eliminazione piatto corretto**
   - `DELETE /meals/:id` ora verifica proprietà del piatto rispetto all'ID del ristorante del ristoratore autenticato (non rispetto all'ID utente).

## Raccomandazioni finali (prima della consegna)

- Aggiungere test automatici (almeno smoke API principali).
- Aggiungere una sezione nella relazione PDF che espliciti i compromessi su ricerca allergeni e routing dedicato “ristorante per piatto”.
- Ridurre log sensibili in produzione (es. stampa token JWT in middleware).

