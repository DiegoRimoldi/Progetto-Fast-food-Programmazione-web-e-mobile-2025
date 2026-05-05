Relazione tecnica e documentazione della repository
Progetto Fast Food - Programmazione Web e Mobile 2025/2026

1) Architettura generale
Il progetto implementa una web app full-stack con backend Node.js + Express, database MongoDB, frontend statico HTML/CSS/JavaScript, API REST documentate con Swagger, autenticazione JWT e integrazione OpenStreetMap (Nominatim + OSRM).

2) Tipologie di file
- index.js: entry point server, middleware globali, connessione DB, bootstrap dati, mount router.
- routes/*.js: controller REST per domini users, meals, restaurants, orders, carts.
- middlewares/*.js: cross-cutting concern per auth e autorizzazione ruolo.
- utils/*.js: utility pure (config/env e validazione indirizzi).
- public/*.html: viste client-side separate per ruoli cliente/ristoratore.
- public/assets/*.css: tema grafico, responsive e stile UI.
- public/assets/auth.js: gestione sessione lato browser, token storage e controllo accessi pagine.
- documents/swagger.json + swagger.js: specifica OpenAPI e generazione automatica.
- documents/meals.json: seed dati iniziali piatti.

3) Backend Node.js/Express
3.1 index.js
Funzioni:
- normalizeMealDocument(meal): normalizza _id da export Mongo (formato $oid) in ObjectId nativo; evita inserimenti con id malformato.
- bootstrapInitialMeals(db): inizializzazione idempotente collezione meals se vuota.
- startServer(): connessione MongoDB, ping, bootstrap seed, registrazione route e error handler.
Scelte: separazione startup/business routes, uso app.locals.db per dependency injection semplice in ogni handler.

3.2 Middleware
- authenticateUser(req,res,next): estrae Bearer token, verifica JWT, popola req.user.
- authorizeRistoratore(req,res,next): gate autorizzativo basato su role.
Scelta: composizione middleware per mantenere controller focalizzati sul dominio.

3.3 utils/config.js
- extractDbNameFromMongoUri(uri): fallback robusto per derivare nome DB.
- validazione variabili ambiente obbligatorie a startup (fail-fast).

3.4 utils/addressValidation.js (OpenStreetMap)
Funzioni principali:
- normalizeValue: normalizzazione testuale (lowercase, rimozione accenti/spazi).
- extractAddressParts: parsing indirizzo, CAP, città, numero civico.
- addressMatches: matching semantico tra input utente e addressdetails Nominatim.
- validateAddressWithOpenStreetMap: orchestrazione validazione, timeout, filtro paese, esito con motivazione.
Scelta: controllo qualità input + verifica remota per ridurre ordini con indirizzi errati.

4) API REST per dominio
4.1 users.js
- sanitizePreferenze / sanitizeMetodoPagamento: igiene input.
- GET /users: lista utenti (projection senza password).
- POST /users/register: regole diverse per cliente/ristoratore, hash bcrypt, controllo univocità, validazione indirizzo OSM.
- POST /users/login: verifica credenziali e JWT.
- GET/PUT /users/me: profilo autenticato.
- PUT /users/me/password: cambio password con hash.
- DELETE /users/me: rimozione account.
Paradigma REST: risorse users con metodi HTTP coerenti; 401/403/404/409/500 gestiti esplicitamente.

4.2 meals.js
- parseCsv: parsing parametri multipli querystring.
- GET /meals con filtri (categoria, area, prezzo, ingredienti, allergeni, offerte, ristorante).
- PUT /meals/offerte: abilita/disabilita offerte con scontistica random 10-50% solo sul menu del ristoratore proprietario.
- GET /meals/:id: dettaglio piatto.
- POST /meals: creazione piatto personalizzato.
- PUT /meals/:id: modifica piatto con ownership check.
- DELETE /meals/:id: eliminazione piatto e sincronizzazione menu ristorante.
Scelta: ownership a livello applicativo usando relazione meal<->ristorante<->ristoratore.

4.3 restaurants.js
Espone CRUD ristorante e gestione menu/bacheca/statistiche legate al ristoratore autenticato.
Scelta: risorsa separata da users per disaccoppiare identità utente e anagrafica attività.

4.4 carts.js
- GET /carts/me
- POST /carts/me/items
- DELETE /carts/me/items/:mealId
- DELETE /carts/me
+ endpoint legacy PUT /add e PUT /remove per retrocompatibilità.
Scelta: documento carrello embedded per utente => letture/scritture rapide.

4.5 orders.js
Funzioni infrastrutturali:
- geocodeAddress: geocoding indirizzi con Nominatim.
- haversineKm: distanza geodetica fallback.
- OSRM route lookup (con timeout): stima distanza/tempi consegna.
Endpoint: creazione ordine, storico cliente, ordini ristoratore, avanzamento stato ordine con macchina a stati (ordinato -> in preparazione -> in consegna -> consegnato).
Scelta: stato ordine esplicito per garantire coerenza del workflow.

5) Database MongoDB
Collezioni principali:
- users: credenziali (password hash), ruolo, dati profilo.
- restaurants: dati ristorante, menu (array ObjectId meals), offerte/bacheca.
- meals: catalogo piatti base + personalizzati.
- carts: carrello per user_id con array meals embedded.
- orders: snapshot ordine (righe, prezzi, stato, distanze/tempi).
Scelte modello:
- embedding su carts/orders per performance di lettura del checkout.
- referencing users/restaurants/meals con ObjectId per integrità logica.

6) Frontend HTML5/CSS3/JavaScript
- HTML5: pagine semantiche separate per flussi cliente e ristoratore.
- CSS3: modern-theme.css + responsive.css per UI coerente e adattiva.
- JavaScript: fetch verso API REST, rendering dinamico menu/carrello/ordini, validazioni base.
- auth.js: gestione token JWT in localStorage/sessionStorage, role-based navigation guard, ripristino ultima pagina visitata.
Bootstrap:
- Uso classi/componenti Bootstrap nelle pagine pubblic per griglie responsive, form, navbar, card e pulsanti con utility classes.
Motivazione: ridurre CSS custom ripetitivo e aumentare consistenza UI.

7) JSON e Swagger/OpenAPI
- JSON usato come formato canonico payload API e documenti MongoDB.
- swagger.js genera swagger.json dagli input route principali.
- /swagger espone UI interattiva per test endpoint e contratti.
Benefici: allineamento backend-frontend, onboarding rapido, test manuale semplice.

8) Corretto uso del paradigma REST
Punti di conformità:
- URI orientati a risorse (/users, /meals, /orders, /carts).
- Metodi HTTP appropriati (GET/POST/PUT/DELETE).
- Status code semanticamente corretti.
- Assenza di sessione server stateful: autenticazione stateless con JWT.
Punti migliorabili:
- endpoint legacy /carts/add e /carts/remove non pienamente REST (già marcati legacy).

9) Sicurezza, robustezza e qualità
- Password hashing con bcrypt.
- JWT con scadenza configurabile.
- Validazione ObjectId e payload in molte route.
- Timeout chiamate esterne OSM/OSRM.
- Error handling centralizzato + error handling locale per endpoint.
- Configurazione fail-fast tramite variabili ambiente obbligatorie.

10) Motivazioni progettuali sintetiche
- Node.js/Express: rapidità sviluppo API asincrone e middleware ecosystem.
- MongoDB: schema flessibile adatto a dominio food delivery iterativo.
- OSM: servizi open per geocoding/routing senza lock-in proprietario.
- Swagger: documentazione viva e verificabile.
- Frontend multi-pagina: separazione netta dei ruoli e curva di apprendimento contenuta.

11) Conclusione
La repository implementa in modo coerente una piattaforma food-delivery didattica completa: autenticazione, gestione catalogo, carrello, ordini, ristoranti, validazione indirizzi geografica e documentazione API. L'architettura rispetta i principi REST, con alcune eccezioni legacy mantenute per compatibilità.
