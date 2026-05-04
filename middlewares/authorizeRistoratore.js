/*
  Middleware di autorizzazione per area ristoratore.
  Dopo l'autenticazione controlla il ruolo utente,
  consentendo solo a profili ristoratore l'accesso alle operazioni riservate.
*/

// SEZIONE: Dichiarazione di costanti, middleware locali o oggetti di supporto.
const authorizeRistoratore = (req, res, next) => {
    if (req.user.role !== "ristoratore") {
      return res.status(403).json({ error: "Accesso consentito solo ai ristoratori" });
    }
    next();
  };
  
  
// SEZIONE EXPORT: Esportiamo il modulo per renderlo riutilizzabile nel progetto.
export default authorizeRistoratore;
  
