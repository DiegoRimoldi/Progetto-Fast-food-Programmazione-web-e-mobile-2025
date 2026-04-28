# Audit funzioni di tipo "Bootstrap"

Data audit: 2026-04-28

## Criterio adottato
Sono state considerate "di tipo Bootstrap" le funzioni che:

1. inizializzano stato/dati all'avvio dell'applicazione o della pagina;
2. vengono invocate immediatamente nella fase di startup;
3. non rappresentano endpoint business ma logica di inizializzazione.

## Risultati

### 1) Backend: `bootstrapInitialMeals`
- **File**: `index.js`
- **Firma**: `async function bootstrapInitialMeals(db)`
- **Comportamento**:
  - verifica se la collection `meals` è già popolata;
  - carica i dati seed da `Documents/meals.json` solo se necessario;
  - viene invocata durante il bootstrap del server in `startServer()`.
- **Esito**: ✅ coerente con una funzione di bootstrap.

### 2) Frontend: `bootstrapNavigationState`
- **File**: `public/assets/auth.js`
- **Firma**: IIFE `(function bootstrapNavigationState() { ... })();`
- **Comportamento**:
  - valida sessione all'avvio;
  - tenta il ripristino della pagina visitata dopo login;
  - viene eseguita immediatamente al caricamento dello script.
- **Esito**: ✅ coerente con una funzione di bootstrap.

## Conclusione
Dalla verifica della repository, le funzioni individuate che devono essere di tipo "Bootstrap" risultano effettivamente implementate e invocate con comportamento da bootstrap.
