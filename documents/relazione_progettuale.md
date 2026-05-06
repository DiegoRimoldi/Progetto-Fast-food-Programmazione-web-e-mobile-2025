# Relazione progettuale — Progetto Fast Food (Programmazione Web e Mobile 2025)

## 1) Obiettivo del progetto

Il repository implementa una piattaforma web completa per la gestione e la fruizione di un servizio fast-food con due ruoli principali:

- **Cliente**: può registrarsi, autenticarsi, sfogliare i ristoranti e i menù, aggiungere prodotti al carrello, effettuare ordini e consultarne lo storico.
- **Ristoratore**: può creare/gestire il proprio ristorante, configurare il menù, monitorare ordini e statistiche, gestire la bacheca/offerte e contenuti collegati.

L’architettura adotta una separazione chiara tra:

- **Backend Node.js/Express** per API, autenticazione e logica applicativa.
- **Frontend statico** (HTML/CSS/JS) organizzato per ruolo e schermata.
- **Documentazione tecnica** (Swagger, relazione tecnica, PDF di specifica).

---

### 1.1 Inquadramento funzionale dei 4 macro-scenari

Il progetto si pone l’obiettivo di sviluppare l’applicazione web **FastFood**, cioè un sito di ordinazione online per ristoranti appartenenti a una catena fast food. In termini operativi, la piattaforma non si limita alla semplice selezione dei piatti, ma governa l’intero ciclo: accesso utente, gestione del ristorante, processamento ordini e supporto alla consegna.

Di seguito la spiegazione dettagliata e relazionata dei 4 macro-scenari citati.

#### A) Gestione del profilo utente

Di seguito sono analizzate in dettaglio le caratteristiche dei 4 macro-scenari introdotti; il primo macro-scenario (Gestione del profilo dell’utente) riguarda la gestione classica dell’identità digitale dell’utente dentro FastFood, dalla creazione dell’account fino alla possibile rimozione del profilo.

In termini funzionali, la piattaforma acquisisce e governa i dati principali dell’utente (anagrafica minima, credenziali e contatti), ne permette l’aggiornamento nel tempo e ne consente la cancellazione quando previsto dal flusso applicativo. Nel progetto esistono due tipologie di utenza, **Cliente** e **Ristoratore**, e questa scelta è centrale perché determina sia la navigazione frontend sia i permessi backend.

La fase di registrazione deve quindi raccogliere almeno: **nome utente**, **indirizzo email**, **password** e soprattutto la **tipologia di utenza** (Ristoratore o Cliente). Questa classificazione iniziale condiziona l’intero percorso successivo: il Cliente accederà ai flussi di esplorazione menù, carrello e ordini, mentre il Ristoratore accederà ai flussi di creazione/gestione ristorante, menu e lavorazione ordini.

Operativamente, questo scenario copre tutto il ciclo di vita dell’account:

- **registrazione** e **autenticazione** (pagine `register.html`, `login.html`, `logout.html` e route `users.js`);
- **definizione della tipologia utente** (cliente/ristoratore), che abilita percorsi diversi dell’interfaccia e delle API;
- **aggiornamento dei dati personali** tramite area profilo (`profilo.html`) e relativi endpoint protetti;
- eventuale **rimozione/disattivazione del profilo** secondo le operazioni esposte dal dominio utenti.

Relazione con gli altri scenari: senza identità utente non è possibile né aprire un ristorante (scenario B), né creare/monitorare ordini (scenario C), né associare correttamente indirizzi e recapiti di consegna (scenario D).

#### B) Gestione del ristorante

Il secondo macro-scenario (Gestione del Ristorante) copre la gestione completa del locale: dalle informazioni anagrafiche principali (nome, sede/luogo, contatti, identificativi fiscali) fino alla costruzione del menu in vendita.

In pratica, il ristoratore deve poter:

- autenticarsi nell’applicazione con il proprio account e operare solo sulle aree autorizzate;
- aggiornare dati e preferenze del proprio profilo/ristorante;
- cancellarsi quando previsto dalle regole applicative;
- mantenere aggiornate le informazioni chiave del locale, tra cui **nome ristorante**, **numero di telefono**, **partita IVA**, **indirizzo** e metadati collegati.

Dal punto di vista catalogo, una volta registrato il ristoratore può inserire i prodotti in vendita sia selezionandoli da una base comune (coerente con il dataset condiviso `documents/meals.json`), sia creando piatti personalizzati gestiti direttamente da lui.

Per ciascun piatto devono essere gestite informazioni complete e coerenti, in particolare:

- **nome del prodotto**;
- **tipologia/categoria**;
- **prezzo**;
- **ingredienti/composizione**;
- **foto illustrativa**.

Questa logica è riflessa nelle pagine dedicate al ristoratore (`creaRistorante.html`, `gestioneRistorante.html`, `gestioneMenù.html`, `piattiGenerici.html`, `piattoPersonalizzato.html`, `modificaPiattoPersonalizzato.html`) e nel dominio backend dei ristoranti/piatti (`routes/restaurants.js`, `routes/meals.js`).

Relazione con gli altri scenari: la qualità e completezza di questo scenario determina direttamente ciò che il cliente vede e acquista (scenario C), e influenza anche fattibilità e correttezza delle consegne (scenario D), oltre a dipendere dai controlli identitari/ruolo del profilo utente (scenario A).

#### C) Gestione degli ordini

Il terzo macro-scenario (Gestione degli Ordini) riguarda la classica gestione delle attività del cliente in un sistema di ordinazione online, dalla preparazione dell’account fino alla chiusura dell’acquisto.

Dal punto di vista utente, il flusso include:

- registrazione, login, aggiornamento dati/preferenze ed eventuale cancellazione del profilo;
- memorizzazione delle informazioni personali (es. nome, cognome) e dei dati di account;
- associazione delle informazioni di pagamento (es. carta di credito o carta prepagata);
- selezione di preferenze utili alla personalizzazione del servizio (es. offerte speciali in base ai prodotti preferiti).

Dopo l’accesso, l’utente registrato può consultare il menù, selezionare uno o più piatti, aggiungerli al carrello, rivedere il contenuto e concludere l’acquisto; l’ordine passa quindi alla fase operativa che porta alla consegna.

Nel progetto questo comportamento è distribuito tra frontend e backend:

- lato cliente: consultazione menù, composizione carrello (`carrello.html`), conferma ordine e storico (`cliente/ordini.html`);
- lato backend: orchestrazione del carrello e della creazione ordine tramite `routes/carts.js` e `routes/orders.js`;
- lato ristoratore: visualizzazione e avanzamento dello stato ordine (`ristoratore/ordini.html`).

Relazione con gli altri scenari: gli ordini dipendono dal profilo autenticato e dalle preferenze utente (scenario A), dall’offerta prodotti configurata dal ristoratore (scenario B) e generano i dati logistici necessari alla consegna (scenario D).

#### D) Gestione delle consegne

Questo macro-scenario governa la parte finale del processo ordine, includendo stati di avanzamento, modalità di ritiro/consegna e dati logistici necessari alla chiusura corretta della richiesta.

Il flusso di stato di un ordine è descritto come sequenza operativa:

1. **ordinato**;
2. **in preparazione**;
3. **in consegna**;
4. **consegnato**.

Il progetto considera due modalità di ritiro:

- **Ritiro presso il ristorante**:
  - viene fornito un tempo di attesa stimato, calcolato considerando la coda di ordini in preparazione;
  - quando il ristoratore segnala l’ordine come pronto/preparato, l’ordine esce dalla coda di lavorazione del ristorante e passa allo stato finale di consegnato (ritiro completato).

- **Consegna a domicilio** (vincolo richiesto: solo per gruppi di due persone):
  - in fase d’ordine, il cliente richiede consegna e specifica l’indirizzo/punto di recapito;
  - viene calcolato un **costo di consegna** dipendente dalla distanza tra ristorante e luogo di consegna;
  - il calcolo distanza può essere supportato da API cartografiche (es. OpenStreetMap), così da derivare i chilometri e determinare il costo logistico;
  - quando l’ordine arriva a destinazione, **l’utente finale conferma la ricezione**: questa segnalazione chiude il ciclo logistico e fa transitare l’ordine dallo stato **in consegna** allo stato **consegnato**.

Nel repository, questa logica è supportata da componenti già presenti: stato ordine e avanzamento lato `routes/orders.js`, dati carrello/checkout in `routes/carts.js` e validazione/coerenza indirizzi in `utils/addressValidation.js`.

Relazione con gli altri scenari: la consegna chiude il flusso end-to-end iniziato con autenticazione utente (A), alimentato dal catalogo ristorante (B) e formalizzato nell’ordine (C), trasformando il dato digitale dell’ordine in servizio effettivamente erogato.

In sintesi, i quattro macro-scenari non sono blocchi indipendenti ma una pipeline integrata: **utente identificato → ristorante configurato → ordine elaborato → consegna gestita**.

## 2) Struttura generale della repository

La repository è organizzata in macro-aree:

### 2.1 Entry-point e configurazione

- `index.js`: avvio del server, inizializzazione middleware e montaggio delle route API.
- `package.json` e `package-lock.json`: dipendenze, script npm, versionamento lock delle librerie.

### 2.2 API backend

- Cartella `routes/` con i moduli endpoint:
  - `users.js`
  - `restaurants.js`
  - `meals.js`
  - `carts.js`
  - `orders.js`

Questi file rappresentano il layer HTTP e incapsulano le operazioni CRUD e le business rules per ciascun dominio.

### 2.3 Middleware di sicurezza/autorizzazione

- `middlewares/authenticateUser.js`: verifica dell’identità utente (tipicamente token/sessione) e iniezione del contesto utente nella request.
- `middlewares/authorizeRistoratore.js`: enforcement del controllo di ruolo per proteggere endpoint dedicati ai ristoratori.

### 2.4 Utility e configurazioni

- `utils/config.js`: variabili e costanti di configurazione condivise.
- `utils/addressValidation.js`: logica di validazione indirizzi (coerenza input geografico/consegna).

### 2.5 Asset documentali e dati di supporto

- `documents/swagger.json` + `documents/swagger.js`: specifica OpenAPI e setup della documentazione endpoint.
- `documents/meals.json`: dataset/semi per i piatti.
- `documents/relazione_tecnica.md`: documento tecnico di riferimento.
- `documents/PWM__project_25_26.pdf`: specifica/brief progettuale originale.

### 2.6 Frontend web statico

- Cartella `public/` con pagine HTML per autenticazione, profilo e dashboard.
- Sottocartelle per ruolo:
  - `public/cliente/` (home, menù, carrello, ordini, offerte)
  - `public/ristoratore/` (creazione ristorante, gestione menù, ordini, statistiche, bacheca, piatti)
- Asset grafici e stile in `public/assets/`:
  - CSS tema (`modern-theme.css`) e responsive (`responsive.css`)
  - script auth client-side (`auth.js`)
  - immagini branding (`logo.png`, `Favicon.png`)

---

## 3) Scelte architetturali e implementative

## 3.1 Pattern a moduli per il backend

L’uso di route separate per dominio (`users`, `restaurants`, `meals`, `carts`, `orders`) permette:

- **manutenibilità**: ogni file tratta un sottoinsieme funzionale coerente;
- **estendibilità**: nuove funzionalità si aggiungono senza impatto trasversale elevato;
- **testabilità**: è più semplice validare endpoint per contesto.

## 3.2 Sicurezza a livelli

La sicurezza è strutturata su più strati:

1. **Autenticazione** via middleware dedicato (`authenticateUser.js`).
2. **Autorizzazione per ruolo** (`authorizeRistoratore.js`) sui percorsi riservati.
3. **Validazione input** (incluse utility come `addressValidation.js`) per ridurre dati inconsisenti.

Questa impostazione evita che un utente non autorizzato possa accedere ad aree di gestione ristorante.

## 3.3 Frontend segmentato per ruolo

La suddivisione in pagine separate sotto `public/cliente/` e `public/ristoratore/` è una scelta funzionale forte:

- semplifica il flusso utente;
- riduce la complessità di ogni vista;
- riflette direttamente i casi d’uso della piattaforma.

## 3.4 Design system minimale ma coerente

Con `modern-theme.css` e `responsive.css` si ottiene:

- coerenza visiva tra pagine;
- adattabilità a dispositivi diversi (desktop/tablet/mobile);
- separazione netta tra contenuto (HTML) e presentazione (CSS).

## 3.5 Vincoli backend, persistenza e paradigma REST

Il progetto adotta un backend realizzato con **Node.js** e organizzato per moduli di dominio; il requisito di persistenza è coerente con un’impostazione orientata a **MongoDB** per la memorizzazione dei dati applicativi (utenti, ristoranti, menu, ordini e informazioni correlate).

A livello di integrazione applicativa, le informazioni mostrate nelle pagine web non sono hardcoded nella UI, ma devono essere recuperate e aggiornate tramite chiamate al backend secondo paradigma **REST**. Questo implica che, per ogni risorsa principale, siano previsti endpoint per:

- **presentazione/lettura** delle informazioni (operazioni di consultazione);
- **modifica/aggiornamento** delle informazioni (operazioni di editing);
- eventuale creazione/rimozione dove previsto dal dominio funzionale.

Nel repository, tale impostazione è rappresentata dalla separazione in route (`routes/users.js`, `routes/restaurants.js`, `routes/meals.js`, `routes/carts.js`, `routes/orders.js`) che fungono da strato API per il frontend.

È inoltre previsto e fornito il requisito di documentazione delle API tramite **Swagger/OpenAPI**, con file `documents/swagger.json` e setup `documents/swagger.js`, così da rendere espliciti contratti, endpoint e payload necessari all’integrazione frontend-backend.

---

## 4) Presentazione del sito web (UX/UI)

## 4.1 Pagine comuni

- `public/index.html`: landing/entry point dell’esperienza utente.
- `public/login.html`, `public/register.html`, `public/logout.html`: ciclo completo di accesso.
- `public/profilo.html`: gestione/visualizzazione dati profilo.

La navigazione è orientata ai task principali (accedere, scegliere ruolo operativo, completare azioni).

## 4.2 Area Cliente

Pagine principali:

- `home.html`: panoramica iniziale e accesso rapido ai contenuti.
- `menù.html`: consultazione catalogo piatti.
- `carrello.html`: revisione articoli e preparazione checkout.
- `ordini.html`: storico e stato ordini.
- `offerte.html`: promozioni e contenuti commerciali.

Il flusso cliente segue la sequenza naturale: **esplora → seleziona → acquista → monitora**.

## 4.3 Area Ristoratore

Pagine principali:

- setup e identità del locale: `creaRistorante.html`, `gestioneRistorante.html`
- gestione prodotto/catalogo: `gestioneMenù.html`, `piattiGenerici.html`, `piattoPersonalizzato.html`, `modificaPiattoPersonalizzato.html`
- gestione operativa: `ordini.html`, `statistiche.html`, `gestioneBacheca.html`, `home.html`

Il flusso ristoratore supporta sia fase iniziale (configurazione) sia operatività giornaliera (ordini, aggiornamenti, analisi).

---

## 5) Operazioni richieste e come sono state realizzate

In base alla struttura effettiva dei moduli, le operazioni centrali del progetto sono coperte come segue.

### 5.0 Operazioni base richieste in fase di discussione progetto

Le operazioni base da presentare in discussione sono coperte nel progetto come segue.

- **Registrazione e login al sito**: supportate dal flusso account (pagine `register.html`, `login.html`, `logout.html`) e dalla gestione utenti lato API (`routes/users.js`).
- **Visualizzazione informazioni su piatti, clienti, ristoratori e acquisti**: i piatti e i dati di catalogo sono mostrati nelle viste cliente/ristoratore e gestiti via `routes/meals.js`; le informazioni di account e storico acquisti sono disponibili nelle aree profilo/ordini (`profilo.html`, `cliente/ordini.html`) con supporto backend `routes/users.js` e `routes/orders.js`.
- **Ricerca ristoranti** (per luogo e nome): implementabile attraverso i flussi di consultazione ristoranti (frontend cliente) e i filtri/endpoint del dominio `routes/restaurants.js`.
- **Ricerca piatti** (per tipologia, nome, prezzo): gestita nel dominio menu/piatti (`routes/meals.js`) e nelle pagine di esplorazione (`cliente/menù.html`, pagine gestione menu ristoratore).
- **Login e ordine di uno o più piatti**: percorso completo cliente autenticato → scelta piatti → carrello (`cliente/carrello.html`) → conferma ordine (`routes/carts.js`, `routes/orders.js`).
- **Gestione consegne**: coperta da stato ordine, modalità ritiro/consegna e validazione indirizzo (`routes/orders.js`, `utils/addressValidation.js`).
- **Visualizzazione statistiche per ristorante**: prevista nell’area ristoratore con pagina dedicata `ristoratore/statistiche.html` e dati aggregati ricavabili dal dominio ordini.
- **Visualizzazione acquisti presenti e passati per cliente**: disponibile nello storico ordini del cliente (`cliente/ordini.html`) con supporto delle route ordini.

Queste operazioni sono relazionate tra loro in un unico flusso: l’utente si autentica, ricerca ristoranti/piatti, effettua acquisti, monitora ordini e consegne, mentre il ristoratore controlla offerta, ordini e statistiche.

### 5.0.1 Operazioni obbligatorie (gruppi) e vincoli tecnologici

Oltre alle operazioni base, il progetto copre e inquadra le operazioni obbligatorie richieste in discussione.

- **Ricerca del ristorante per piatto**: la relazione tra catalogo piatti e ristorante consente di risalire ai locali che vendono un determinato prodotto, combinando dati dominio ristoranti (`routes/restaurants.js`) e piatti (`routes/meals.js`).
- **Ricerca di piatti per ingredienti**: il modello dei piatti include la composizione/ingredienti; quindi è possibile filtrare il menu per ingrediente, sia in ottica consultazione cliente sia in gestione catalogo ristoratore.
- **Ricerca di piatti per allergie**: partendo dai metadati ingredienti, è possibile impostare filtri di esclusione/allerta per categorie allergeniche, così da mostrare piatti compatibili con vincoli alimentari dell’utente.
- **Consegna a domicilio**: già descritta nello scenario D con gestione indirizzo, distanza/costo e transizione di stato ordine fino a `consegnato`.

Queste operazioni si legano direttamente ai flussi principali: ricerca intelligente (piatto/ingrediente/allergia) → selezione prodotto → carrello/ordine → consegna.

Inoltre, il progetto prevede il requisito di bootstrap dati: **allo startup applicativo**, i dati iniziali necessari devono essere disponibili nel backend. Nel repository questo vincolo è coerente con la presenza del dataset JSON (`documents/meals.json`) e con la fase di setup/caricamento documentata.

Sul piano tecnologico, le pagine web rispettano l’impostazione richiesta: uso di **HTML5**, **CSS3** e **JavaScript**, con separazione tra:

- **struttura** della pagina (HTML);
- **rappresentazione/stile** (CSS, con temi e responsive dedicati);
- **comportamento client-side** (JavaScript).

Questo approccio mantiene il frontend modulare, leggibile e facilmente estendibile con funzionalità aggiuntive.

## 5.1 Gestione utenti e autenticazione

- **Registrazione/login/logout**: pagine dedicate nel frontend e route `users.js` nel backend.
- **Protezione risorse**: middleware di autenticazione applicato alle rotte sensibili.

Scelta implementativa: mantenere separati endpoint utente e controlli di sicurezza per miglior riuso e chiarezza.

## 5.2 Gestione ristoranti

- Route `restaurants.js` per creazione, aggiornamento e consultazione ristoranti.
- Dashboard ristoratore con schermate dedicate alla gestione dello stato del locale.

Scelta implementativa: accoppiare strettamente il dominio “ristorante” al ruolo ristoratore, con restrizioni lato middleware.

## 5.3 Gestione menù e piatti

- Route `meals.js` per CRUD su prodotti/piatti.
- Supporto a piatti generici e personalizzati tramite pagine differenziate.
- Dataset `documents/meals.json` come base dati iniziale/di esempio.

Scelta implementativa: separare il livello dati (JSON/documenti) dalla presentazione per favorire evoluzione futura verso DB completo.

## 5.4 Carrello e ordini

- `carts.js`: logica di composizione carrello lato backend.
- `orders.js`: creazione e monitoraggio ordini.
- Pagine cliente dedicate (`carrello.html`, `ordini.html`) e pagina ristoratore ordini (`public/ristoratore/ordini.html`).

Scelta implementativa: suddividere i due domini, pur collegati, per mantenere la semantica delle API più pulita.

## 5.5 Validazione indirizzi e coerenza consegna

- Utility `addressValidation.js` per validare l’input di recapito/consegna.

Scelta implementativa: estrarre la logica di validazione in utilità riusabile, evitando duplicazione nei controller route.

## 5.6 Documentazione API

- `swagger.json` come contratto API formalizzato.
- `swagger.js` per esposizione/integrazione documentazione.

Scelta implementativa: includere la documentazione nel repo per allineare sviluppo backend e consumo frontend.

---

## 6) Scelte trasversali nei file della repository

1. **Organizzazione per responsabilità**: route, middleware, utility, pagine, asset e documenti separati.
2. **Ruoli espliciti nel frontend**: distinzione cliente/ristoratore riflessa già nel filesystem.
3. **Scalabilità didattica**: struttura abbastanza semplice per apprendimento, ma già aderente a convenzioni professionali.
4. **Tracciabilità delle API**: presenza della specifica Swagger per debugging e onboarding.
5. **Coerenza visiva**: fogli di stile centralizzati e immagini brand condivise.

---

## 7) Possibili miglioramenti evolutivi

Per una futura estensione del progetto:

- introduzione di un database persistente strutturato (SQL/NoSQL) con layer model/repository;
- test automatici (unit/integration/e2e) su route e flussi critici;
- centralizzazione gestione errori con middleware dedicato;
- validazione schema payload con librerie (es. Joi/Zod);
- logging strutturato e monitoraggio performance;
- pipeline CI/CD con linting e test obbligatori;
- internazionalizzazione UI e accessibilità avanzata.

---

## 8) Conclusioni

La repository mostra un progetto web full-stack orientato ai casi d’uso reali del food ordering, con una distinzione netta tra componente cliente e ristoratore, API modulari e documentazione tecnica integrata. Le scelte implementative privilegiano chiarezza, modularità e facilità di manutenzione, mantenendo una base solida per evoluzioni successive in termini di robustezza, automazione e scalabilità.
