# Relazione Tecnica Completa (`documents` + `middlewares` + `node_modules` + `public/assets`)
## Progetto “Fast Food” — Programmazione Web e Mobile 2025/2026

> Documento aggiornato con le stesse indicazioni richieste: analisi partire da `documents` e ampliamento a `middlewares`, `node_modules` rilevanti e `public/assets`.

---

## 1) Ambito analizzato

### Cartella `documents`
1. `documents/swagger.js`
2. `documents/swagger.json`
3. `documents/meals.json`
4. `documents/PWM__project_25_26.pdf`

### Cartella `middlewares`
5. `middlewares/authenticateUser.js`
6. `middlewares/authorizeRistoratore.js`

### Cartella `node_modules` (perimetro funzionale rilevante)
7. `node_modules/swagger-autogen/swagger-autogen.js`
8. `node_modules/swagger-autogen/package.json`
9. `node_modules/jsonwebtoken/verify.js`
10. `node_modules/jsonwebtoken/package.json`

### Cartella `public/assets`
11. `public/assets/auth.js`
12. `public/assets/modern-theme.css`
13. `public/assets/responsive.css`
14. `public/assets/logo.png`
15. `public/assets/Favicon.png`

### Cartella `public/cliente`
16. `public/cliente/home.html`
17. `public/cliente/menù.html`
18. `public/cliente/offerte.html`
19. `public/cliente/carrello.html`
20. `public/cliente/ordini.html`

### Cartella `public/ristoratore`
21. `public/ristoratore/home.html`
22. `public/ristoratore/creaRistorante.html`
23. `public/ristoratore/gestioneRistorante.html`
24. `public/ristoratore/gestioneMenù.html`
25. `public/ristoratore/gestioneBacheca.html`
26. `public/ristoratore/piattiGenerici.html`
27. `public/ristoratore/piattoPersonalizzato.html`
28. `public/ristoratore/modificaPiattoPersonalizzato.html`
29. `public/ristoratore/ordini.html`
30. `public/ristoratore/statistiche.html`


### Cartella `public` (root)
31. `public/index.html`
32. `public/login.html`
33. `public/register.html`
34. `public/logout.html`
35. `public/profilo.html`


### Cartella `routes`
36. `routes/users.js`
37. `routes/meals.js`
38. `routes/restaurants.js`
39. `routes/orders.js`
40. `routes/carts.js`


### Cartella `utils`
41. `utils/config.js`
42. `utils/addressValidation.js`


### Root repository `Progetto-Fast-food-Programmazione-web-e-mobile-2025`
43. `index.js`
44. `package.json`
45. `package-lock.json`
46. `README.md`
47. `.gitignore`
48. `.gitattributes`

> Nota: come per `node_modules`, l’analisi funzione-per-funzione è applicata ai file di codice eseguibile (`.js`). I file CSS e immagini sono trattati come asset statici.

---

## 2) Analisi tecnica dettagliata per file

## 2.1 `documents/swagger.js`

### Ruolo
Script locale che avvia la generazione Swagger/OpenAPI.

### Funzione chiamata: `swaggerAutogen(outputFile, inputFiles, doc)`
- Genera/aggiorna `documents/swagger.json` in base ai file route indicati.

---

## 2.2 `documents/swagger.json`

### Ruolo
Contratto OpenAPI serializzato.

### Nota
- File dati, nessuna funzione eseguibile.

---

## 2.3 `documents/meals.json`

### Ruolo
Seed dati iniziale pasti.

### Nota
- File dati, nessuna funzione eseguibile.

---

## 2.4 `documents/PWM__project_25_26.pdf`

### Ruolo
Documento progettuale.

### Nota
- Artefatto binario non commentabile funzione-per-funzione.

---

## 2.5 `middlewares/authenticateUser.js`

### Funzione: `authenticateUser(req, res, next)`

**Scopo**
- Validare JWT da header `Authorization` e popolare `req.user`.

**Flusso**
1. Controllo presenza/formato `Bearer`.
2. Estrazione token.
3. `jwt.verify(token, JWT_SECRET)`.
4. Validazione `payload.userId` e `payload.role`.
5. Assegnazione `req.user`.
6. `next()` o `401` in errore.

---

## 2.6 `middlewares/authorizeRistoratore.js`

### Funzione: `authorizeRistoratore(req, res, next)`

**Scopo**
- Consentire accesso solo a ruolo `ristoratore`.

**Flusso**
1. Verifica `req.user.role`.
2. Se diverso da `ristoratore` ritorna `403`.
3. Altrimenti `next()`.

---

## 2.7 `node_modules/swagger-autogen/package.json`

### Ruolo
Metadati pacchetto e identificazione entrypoint (`swagger-autogen.js`).

---

## 2.8 `node_modules/swagger-autogen/swagger-autogen.js`

### Funzione esportata: `module.exports = function (args, endpointsFiles, data)`

**Scopo**
- Configurare opzioni autogenerazione Swagger e avviare `init(...)`.

### Funzione interna: `init(outputFile, endpointsFiles, data)`

**Scopo**
- Eseguire pipeline completa: risoluzione path, verifica file endpoint, merge path API, normalizzazione output, scrittura JSON.

---

## 2.9 `node_modules/jsonwebtoken/package.json`

### Ruolo
Metadati libreria JWT usata da `authenticateUser`.

---

## 2.10 `node_modules/jsonwebtoken/verify.js`

### Funzione esportata: `module.exports = function (jwtString, secretOrPublicKey, options, callback)`

**Scopo**
- Verificare struttura, firma e claim del JWT.

**Flusso sintetico**
1. Normalizza opzioni.
2. Valida formato JWT (3 parti).
3. Decodifica token.
4. Recupera/valida chiave e algoritmo.
5. Verifica firma crittografica.
6. Verifica claim temporali (`nbf`, `exp`) e semantici (`aud`, `iss`, `sub`).

---

## 2.11 `public/assets/auth.js`

### Ruolo
Modulo frontend auto-eseguito (IIFE) per gestione sessione client, validazione token lato browser e protezione pagine per ruolo.

### Struttura generale
- Tutto il file è incapsulato in una IIFE: `(function () { ... })();`
- Evita inquinamento del global scope, esponendo solo API minime su `window`.

### Funzioni dettagliate

#### 1) `getCurrentPath()`
**Scopo:** ottenere `window.location.pathname` con fallback `/`.

#### 2) `normalizePathname(pathname)`
**Scopo:** rimuovere query/hash dal path per confronti coerenti.

#### 3) `isAuthPage(pathname)`
**Scopo:** verificare se il path è una pagina di autenticazione (`/login.html`, `/register.html`, ecc.).

#### 4) `saveLastVisitedPath(pathname)`
**Scopo:** salvare in `sessionStorage` l’ultima pagina non-auth visitata.
**Gestione errori:** `try/catch` per gestire browser policy/storage non disponibile.

#### 5) `restoreLastVisitedPath(payload)`
**Scopo:** dopo login, ripristinare la pagina precedente o usare fallback per ruolo (`/ristoratore/home.html` o `/cliente/home.html`).

#### 6) `decodeJwtPayload(token)`
**Scopo:** decodificare payload JWT lato client senza verifica firma.
**Passi:** split token, conversione base64url→base64, padding, `atob`, `JSON.parse`.
**Nota:** utile per UX/navigation state; non sostituisce verifica server-side.

#### 7) `showAuthIssue(message)`
**Scopo:** uniformare logging warning auth e ritorno `false`.

#### 8) `inferRoleFromPath(pathname)`
**Scopo:** inferire ruolo (`ristoratore`/`cliente`) dal prefisso URL.

#### 9) `getRoleScopedValue(baseKey, role)`
**Scopo:** leggere da `localStorage` una chiave specifica per ruolo (`token_ristoratore`, ecc.).

#### 10) `setRoleScopedValue(baseKey, role, value)`
**Scopo:** scrivere in `localStorage` valori namespace per ruolo.

#### 11) `validateSession(expectedRole)`
**Scopo:** funzione centrale di validazione sessione client.
**Flusso:**
1. Determina ruolo attivo (atteso o inferito dal path).
2. Recupera token role-scoped o fallback globale.
3. Decodifica payload e verifica campi minimi (`role`, `userId`).
4. Se mismatch ruolo, tenta fallback con token globale.
5. Sincronizza storage globale e per ruolo (`token`, `role`, `userId`).
6. Salva percorso corrente.
7. Ritorna payload valido o `null`.

#### 12) `bootstrapNavigationState()` (IIFE interna)
**Scopo:** all’avvio pagina valida sessione e prova ripristino ultima pagina.

### API esposte su `window`

#### `window.handleAuthIssue(reason)`
- Wrapper di `showAuthIssue`.

#### `window.ensureAuthenticated()`
- Ritorna `true` se sessione valida, altrimenti `false` + warning.

#### `window.ensureAuthenticatedRole(expectedRole)`
- Valida autenticazione + coerenza ruolo rispetto alla pagina.
- Previene redirect involontari su refresh in caso mismatch.

---

## 2.12 `public/assets/modern-theme.css`

### Ruolo
Foglio stile principale tema UI moderno (tipografia, layout, componenti, colori).

### Nota
- Asset statico: nessuna funzione JS.

---

## 2.13 `public/assets/responsive.css`

### Ruolo
Regole responsive/adattive per viewport differenti.

### Nota
- Asset statico: nessuna funzione JS.

---

## 2.14 `public/assets/logo.png` e `public/assets/Favicon.png`

### Ruolo
Asset grafici branding/interfaccia.

### Nota
- Risorse binarie non eseguibili.

---


## 2.15 `public/cliente/*.html`

### Ruolo generale
Le pagine `public/cliente` implementano i flussi frontend del cliente (home, menu, offerte, carrello, ordini), riusando `../assets/auth.js` per i controlli di autenticazione/ruolo.

### File inclusi
- `public/cliente/home.html`
- `public/cliente/menù.html`
- `public/cliente/offerte.html`
- `public/cliente/carrello.html`
- `public/cliente/ordini.html`

### Analisi funzione-per-funzione

#### `public/cliente/home.html`
- `fetchConControlloToken(url, options = {})`: wrapper fetch con header `Authorization` e controllo errori token.
- `ricercaRistoranti(queryName, queryAddress)`: invoca endpoint ricerca ristoranti e applica filtri input utente.
- `mostraRistoranti(lista)`: rendering DOM elenco ristoranti e stati vuoto/errore.

#### `public/cliente/menù.html`
- `fetchConControlloToken(url, options = {})`: fetch autenticato con gestione sessione invalida.
- `caricaMenu()`: carica dati menu dal backend e prepara dataset UI.
- `mostraPiatti(lista)`: rendering schede piatto.
- `addToCart(piatto)`: chiamata API per aggiunta al carrello e feedback utente.
- `generaCategorie(piatti)`: costruisce dinamicamente categorie filtro dal dataset.
- `applicaFiltri()`: filtra lista piatti secondo categoria/ricerca/altri criteri UI.

#### `public/cliente/offerte.html`
- `getIdAsString(idValue)`: normalizzazione ID (ObjectId/string) per confronti coerenti.
- `readArrayFromLocalStorage(key)`: lettura robusta array da localStorage con fallback.
- `getMealIdAsString(meal)`: estrazione ID piatto normalizzato.
- `fetchWithAuth(url, options)`: wrapper fetch autenticato.
- `normalizeMeal(meal)`: normalizzazione shape dati pasto per rendering/filtri.
- `isMealAllowedByPreference(meal)`: verifica compatibilità offerta con preferenze utente.
- `buildScenarioContent(hasOffers, hasPreferences, hasPreferenceMatches)`: produce contenuto UI in base allo scenario.
- `addToCart(meal)`: aggiunge offerta al carrello.
- `renderGroupedOffers(meals, emptyMessage)`: rendering offerte raggruppate per ristorante/scenario.
- `loadUserPreferences()`: recupero preferenze utente.
- `loadOffers()`: recupero offerte e avvio pipeline rendering.

#### `public/cliente/carrello.html`
- `fetchConControlloToken(url, options = {})`: fetch autenticato con fallback su sessione non valida.
- `recuperaCarrello()`: recupera stato carrello corrente.
- `recuperaIndirizzoUtente()`: legge indirizzo utente necessario per consegna.
- `mostraMessaggio(tipo, testo)`: mostra feedback UI (errore/successo/info).
- `estraiComponentiIndirizzo(indirizzo)`: parsing indirizzo testuale in componenti utili.
- `corrispondeValore(valoreUtente, possibiliValori)`: helper matching semantico valori indirizzo.
- `validaIndirizzoReale(indirizzo)`: validazione indirizzo via servizio esterno/Nominatim.
- `mostraCarrello()`: rendering completo carrello, grouping per ristorante e totali.
- `rimuoviDalCarrello(mealId)`: rimozione item dal carrello.
- handler click `orderBtn`: validazioni checkout, costruzione payload ordini e invio API.
- `(async function init() { ... })()`: bootstrap iniziale pagina (load dati + rendering).

#### `public/cliente/ordini.html`
- `fetchConControlloToken(url, options = {})`: wrapper fetch autenticato.
- `formatEuro(value)`: formattazione prezzo in valuta EUR.
- `normalizzaClasseStato(stato)`: mapping stato ordine → classe CSS.
- `creaDettagliPasti(order)`: genera markup dettagli pasti per ordine.
- `creaCardOrdine(order)`: genera card HTML ordine completa.
- `parseDataOrdine(dataOrdine)`: parsing robusto data ordine per sorting.
- `caricaOrdiniCliente()`: fetch storico ordini, ordinamento e rendering.
- `confermaConsegna(orderId, buttonElement)`: conferma ricezione ordine via API e aggiorna UI.

---


## 2.16 `public/ristoratore/*.html`

### Ruolo generale
Le pagine `public/ristoratore` implementano i flussi operativi del ristoratore: creazione/gestione ristorante, gestione menu e bacheca/offerte, CRUD piatti personalizzati, monitoraggio ordini e statistiche.

### Analisi funzione-per-funzione (sintesi per pagina)

#### `public/ristoratore/home.html`
- `fetchConControlloToken(...)`: wrapper fetch autenticato.
- `caricaDatiRistorante()`: recupera dati del ristorante del ristoratore loggato.
- `caricaOrdini(ristoranteId)`: recupera e renderizza riepilogo ordini recenti.

#### `public/ristoratore/creaRistorante.html`
- `mostraFeedback(tipo, messaggio)`: feedback UX form.
- `resetCampo(...)`, `evidenziaCampoErrore(...)`, `resetValidazione()`: utilità validazione UI.
- `trovaCampoDaErrore(messaggio)`: mapping errore backend → campo form.
- `validaForm()`: validazione completa client-side prima submit.
- `fetchConControlloToken(...)`: invio autenticato payload creazione.

#### `public/ristoratore/gestioneRistorante.html`
- `fetchConControlloToken(...)`: wrapper auth.
- `caricaDatiRistorante()`: load dati correnti e rendering form.
- `confrontaValori(a,b)`: helper confronto robusto.
- `nessunaModificaRistorante(payload, originale)`: evita update inutili se nessuna modifica.

#### `public/ristoratore/gestioneMenù.html`
- Funzioni storage/selezione: `getIdAsString`, `readArrayFromLocalStorage`, `getBachecaStorageKey`, `getBachecaIds`, `salvaBachecaRistorante`.
- Funzioni dati/render: `fetchConControlloToken`, `caricaRistorante`, `caricaMenu`, `renderizzaMenu`, `creaCardPiatto`, `mostraDettagliPiatto`.
- Funzioni azioni bulk: `toggleMealSelection`, `ripristinaPiattiSelezionati`, `selezionaTuttiIPiatti`, `updateDeleteButtonLabel`, `eliminaPiattiSelezionati`, `aggiungiPiattiInBacheca`.
- Bootstrap: IIFE `init()`.

#### `public/ristoratore/gestioneBacheca.html`
- Include quasi la stessa base di `gestioneMenù` + logica offerte.
- Funzioni offerte: `aggiornaOfferteMeals`, `aggiornaOffertaMeal`, `aggiungiPiattiAlleOfferte`, `rimuoviPiattiDalleOfferte`.
- Funzione distruttiva: `eliminaPiattiSelezionati`.
- Helper messaggi: `getNomePiatto`, `getMessaggioPiattiGiaInOfferta`, `getMessaggioPiattiAggiunti`.

#### `public/ristoratore/piattiGenerici.html`
- `caricaPiattiGenerici()`, `caricaCategorie()`: dataset catalogo generico.
- `displayGenericMealsPage(page)`, `updatePaginationControls()`: paginazione lato client.
- `bindMealSelectionEvents`, `toggleMealSelection`, `updateAddSelectedButtonLabel`: selezione multipla.
- `aggiungiPiattoAlMenu(idMeal)`, `aggiungiPiattiSelezionatiAlMenu()`: inserimento in menu ristorante.
- `applicaFiltri()`: filtri categoria/ricerca.

#### `public/ristoratore/piattoPersonalizzato.html`
- `fetchConControlloToken(...)`, `caricaRistorante()`: contesto auth/ristorante.
- Handler submit form (`addEventListener('submit', ...)`): costruzione payload piatto custom e POST backend.
- IIFE `init()` di bootstrap.

#### `public/ristoratore/modificaPiattoPersonalizzato.html`
- `renderCards()`: render elenco/edit action piatti custom.
- `popolaForm(piatto)`: bind valori selezionati nel form modifica.
- `caricaDettagliPiatto(idMeal)`: fetch dettaglio singolo piatto.
- `caricaRistorante()`: contesto owner e filtri.
- IIFE `init()`.

#### `public/ristoratore/ordini.html`
- Formattazione/render: `estraiTimestampOrdine`, `formatEuro`, `renderPrezzoOrdine`, `renderSubtotaleOrdine`, `normalizzaClasseStato`, `creaDettagliPasti`, `creaCardOrdine`.
- Dati e azioni: `fetchConControlloToken`, `caricaOrdiniRistoratore`, `cambiaStatoOrdine`, `confermaLetturaNotificheConsegna`.
- Gestione separata ordini attivi/storico e transizioni stato.

#### `public/ristoratore/statistiche.html`
- `fetchConControlloToken(...)`: accesso endpoint statistiche.
- `renderListItem(label, value, suffix)`: rendering righe KPI.
- `formatDateLabel(dateString)`: formattazione etichette temporali.
- `caricaStatistiche()`: orchestrazione fetch KPI e rendering dashboard.

---


## 2.17 `public/*.html` (root)

### Ruolo generale
Le pagine nel root di `public` coprono accesso, onboarding, uscita sessione, profilo utente e landing page applicativa.

### Analisi funzione-per-funzione

#### `public/index.html`
- Landing page statica: non include funzioni JavaScript applicative.

#### `public/login.html`
- Handler submit (`loginForm.addEventListener("submit", ...)`): valida input base, invia credenziali al backend, salva token/ruolo in storage e gestisce redirect in base al ruolo.

#### `public/register.html`
- `updateFields()`: abilita/disabilita campi in base al ruolo scelto.
- `renderPreferenze(categorie)`: rendering chip preferenze alimentari.
- `validaUsername(username)`: validazione formato username.
- `getPreferenzeSelezionate()`: estrazione preferenze attive dalla UI.
- `resetErrors()`, `showFieldError(...)`, `clearFieldError(...)`, `focusAndScrollToField(...)`: gestione UX errori form.
- `validateForm(values)`: validazione completa campi registrazione.
- `caricaCategoriePreferenze()`: carica categorie da API pasti per popolare preferenze.
- Handler eventi `click/input/blur/invalid/submit`: orchestrano validazione progressiva + invio registrazione.

#### `public/logout.html`
- Script inline di logout: rimozione token/dati sessione da storage e redirect a pagina di ingresso/login.

#### `public/profilo.html`
- `goBack()`: ritorno contestuale alla home di ruolo.
- `fetchConControlloToken(...)`: wrapper fetch autenticato.
- `mostraMessaggio(...)`, `pulisciMessaggio(...)`, `mostraEsitoAggiornamentoProfilo(...)`: gestione feedback UI.
- Validator: `validaEmail`, `validaUsername`, `validaTelefono`, `validaPiva`, `validaPassword`.
- Preferenze: `renderPreferenze(...)`, `getPreferenzeSelezionate()`, `caricaCategoriePreferenze()`.
- `trovaDifferenze(payload)`: calcola modifiche reali prima dell’update.
- `caricaDatiProfilo()`: fetch dati utente e popolamento form.
- Handler submit/click:
  - aggiornamento profilo,
  - cambio password,
  - cancellazione account.

---


## 2.18 `routes/*.js`

### Ruolo generale
La cartella `routes` contiene la logica API REST principale (controller Express), con middleware di autenticazione/autorizzazione e accesso a MongoDB tramite `req.app.locals.db`.

### `routes/users.js`
**Funzioni helper**
- `sanitizePreferenze(preferenze)`: normalizza e deduplica preferenze alimentari.
- `sanitizeMetodoPagamento(metodoPagamento)`: normalizza metodo di pagamento.

**Endpoint principali**
- `GET /users`: elenco utenti (projection senza password).
- `POST /users/register`: registrazione con validazioni per ruolo e dati obbligatori.
- `POST /users/login`: autenticazione + emissione JWT.
- `GET /users/me`: profilo autenticato.
- `PUT /users/me`: aggiornamento profilo con validazioni e controllo coerenza.
- `PUT /users/me/password`: cambio password autenticato.
- `DELETE /users/me`: cancellazione account e cleanup correlato.

### `routes/meals.js`
**Funzione helper**
- `parseCsv(value)`: parser CSV robusto per query param (ingredienti/allergeni).

**Endpoint principali**
- `GET /meals`: listing con filtri avanzati (categoria, prezzo, ingredienti, allergeni, area, offerte).
- `PUT /meals/offerte`: aggiornamento massivo flag/sconto offerte (ristoratore).
- `GET /meals/:id`: dettaglio pasto.
- `POST /meals`: creazione piatto (owner ristoratore).
- `PUT /meals/:id`: modifica piatto con controlli owner.
- `DELETE /meals/:id`: cancellazione piatto autorizzata.

### `routes/restaurants.js`
**Funzioni helper**
- `parseOrderDateToDate(rawValue)`: parsing robusto data ordine.
- `getYyyyMmDd(dateValue)`: normalizzazione data `YYYY-MM-DD`.

**Endpoint principali**
- `GET /restaurants/search`: ricerca per nome/indirizzo.
- `GET /restaurants/by-meal`: lookup ristoranti a partire da meals.
- `GET /restaurants`: elenco ristoranti.
- `GET /restaurants/statistics`: KPI ristoratore (ordini, fatturato, top pasti, timeline).
- `GET /restaurants/:restaurantId`: dettaglio ristorante + menu arricchito.
- `POST /restaurants`: creazione ristorante autenticata.
- `PUT /restaurants/:restaurantId`: aggiornamento ristorante owner-only.
- `DELETE /restaurants/:restaurantId`: eliminazione ristorante owner-only.

### `routes/orders.js`
**Funzioni helper**
- `geocodeAddress(address)`: geocoding indirizzo tramite provider esterno.
- `haversineKm(coord1, coord2)`: fallback distanza geodetica.
- `getDrivingRouteMetrics(coordFrom, coordTo)`: routing stradale (km/min) via OSRM.
- `calculateOrderPreparationMinutes(order)`: stima tempi preparazione backlog.
- `updateOrderStatus(req,res)`: logica condivisa transizione stato ordine.

**Endpoint principali**
- `POST /orders`: creazione ordini da carrello (anche multi-ristorante).
- `GET /orders`: storico ordini (cliente/ristoratore in base al ruolo).
- `PUT /orders/notifiche-consegna/ack`: ack notifiche consegna lato ristoratore.
- `GET /orders/:id`: dettaglio ordine con controlli accesso.
- `PUT /orders/:id/consegna`: conferma consegna lato cliente.
- `PUT /orders/:id/stato` (tramite handler dedicato): avanzamento stato operativo.

### `routes/carts.js`
**Endpoint principali**
- `GET /carts/me`: recupero carrello utente.
- `POST /carts/me/items`: aggiunta item al carrello con merge quantità.
- `DELETE /carts/me/items/:mealId`: rimozione item.
- `DELETE /carts/me`: svuotamento carrello.
- `PUT /carts/add`: incremento quantità item.
- `PUT /carts/remove`: decremento/rimozione quantità item.

---


## 2.19 `utils/*.js`

### Ruolo generale
I file in `utils` contengono logica trasversale riusabile: configurazione applicativa fail-fast e validazione indirizzi con OpenStreetMap/Nominatim.

### `utils/config.js`

#### Funzione: `extractDbNameFromMongoUri(uri)`
**Scopo**
- Estrarre il nome DB dalla URI Mongo quando `MONGODB_DB` non è esplicitato.

**Comportamento**
- Se URI assente ritorna `null`.
- Tenta parse con `new URL(uri)`.
- Estrae pathname senza `/` iniziale e prende il primo segmento come nome DB.
- In caso di URI invalida ritorna `null` (catch silenzioso).

#### Altra logica rilevante del modulo
- `dotenv.config()`: carica variabili `.env`.
- Costruisce `requiredEnvVars` e `missingEnvVars`.
- Se mancano variabili critiche (`MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`, `JWT_EXPIRES_IN`) lancia errore bloccante.
- Esporta oggetto `config` tipizzato per bootstrap server (`PORT`, URI DB, segreti JWT).

### `utils/addressValidation.js`

#### Funzione: `normalizeValue(value = "")`
**Scopo**
- Normalizzare stringhe (trim/lowercase/rimozione accenti/spazi multipli) per confronti robusti.

#### Funzione: `extractAddressParts(rawAddress = "")`
**Scopo**
- Fare parsing semantico dell’indirizzo utente.

**Output**
- `address`, `chunks`, `cap`, `streetChunk`, `cityChunk`, `hasStreetNumber`.

#### Funzione: `addressMatches(parsedInput, nominatimAddress = {})`
**Scopo**
- Verificare coerenza fra indirizzo utente parsato e `addressdetails` restituiti da Nominatim.

**Dettagli**
- Normalizza tipi strada (via/viale/piazza/...).
- Confronta strada, città e CAP con matching tollerante.
- Ritorna `true` solo se tutti i campi chiave corrispondono.

#### Funzione export: `validateAddressWithOpenStreetMap(rawAddress, options = {})`
**Scopo**
- Validare un indirizzo italiano (default `expectedCountryCode = "it"`) con controlli sintattici + verifica remota OSM.

**Flusso**
1. Parsing input con `extractAddressParts`.
2. Validazioni preliminari (lunghezza minima, civico, CAP, città).
3. Costruzione URL Nominatim (`jsonv2`, `addressdetails`, `limit`, `countrycodes`).
4. Chiamata `fetch` con timeout (`AbortController`).
5. Controllo response + parsing JSON risultati.
6. Ricerca di un risultato coerente tramite `addressMatches`.
7. Ritorno esito strutturato:
   - `{ valid: true, normalizedAddress, coordinates }` oppure
   - `{ valid: false, reason }`.
8. Cleanup timeout in `finally`.

**Criticità operative**
- Dipende da disponibilità rete/provider esterno.
- Richiede gestione rate-limit e policy User-Agent lato produzione.

---


## 2.20 Root repository (`Progetto-Fast-food-Programmazione-web-e-mobile-2025`)

### Ruolo generale
La root del progetto contiene entrypoint backend, metadata di dipendenze/build, documentazione generale e file di configurazione Git.

### `index.js` (entrypoint server)

#### Funzione: `normalizeMealDocument(meal)`
**Scopo**
- Normalizzare i record seed pasti convertendo `_id` in `ObjectId` valido quando presente in formato export (`$oid`).

**Comportamento**
- Copia il documento (`{ ...meal }`).
- Se `_id.$oid` è valido crea `new ObjectId(...)`.
- Altrimenti rimuove `_id` per lasciare che Mongo lo generi.

#### Funzione: `bootstrapInitialMeals(db)`
**Scopo**
- Eseguire seed idempotente della collection `meals` da `documents/meals.json`.

**Comportamento**
1. Legge count documenti in `meals`.
2. Se non vuota, esce subito.
3. Carica JSON seed.
4. Normalizza con `normalizeMealDocument`.
5. Inserisce batch con `insertMany(..., { ordered: false })`.

#### Funzione: `startServer()`
**Scopo**
- Avvio completo applicazione Express + connessione MongoDB + bootstrap route/middleware.

**Flusso**
1. Connessione Mongo tramite `MongoClient` usando `config.MONGODB_URI`.
2. Bind DB in `app.locals.db` + `ping` di verifica.
3. Esecuzione seed iniziale pasti.
4. Registrazione route (`/users`, `/meals`, `/restaurants`, `/orders`, `/carts`).
5. Setup error middleware globale.
6. Avvio `app.listen(PORT)`.
7. In caso errore bootstrap: log + `process.exit(1)`.

### Altri file root
- `package.json`: definisce script npm, dipendenze runtime/dev e metadata progetto.
- `package-lock.json`: lockfile versioni dipendenze per build riproducibili.
- `README.md`: documentazione utente/sviluppatore ad alto livello.
- `.gitignore`: esclusione file/cartelle non versionabili (es. `node_modules`, env locali).
- `.gitattributes`: attributi Git per normalizzazione/testi/binari.

---

## 3) Flusso integrato complessivo

1. `documents/swagger.js` produce `documents/swagger.json` tramite `swagger-autogen`.
2. Backend protegge le route via `authenticateUser` + `authorizeRistoratore`.
3. Frontend (`public/assets/auth.js`) gestisce stato sessione client e controllo accesso pagina lato UX.
4. `jsonwebtoken/verify.js` realizza la verifica token effettiva usata dal middleware server.
5. `meals.json` e asset statici (`css`, `png`, `pdf`) completano bootstrap e presentazione.

---

## 4) Conclusioni

Con questa revisione, la relazione include anche `public/assets`, `public/cliente`, `public/ristoratore`, `public` root, `routes`, `utils` e root repository mantenendo il criterio richiesto:
- commento funzione-per-funzione su file eseguibili (`auth.js`),
- classificazione tecnica dei file statici (CSS/immagini),
- coerenza con i blocchi precedenti (`documents`, `middlewares`, `node_modules` rilevanti).
