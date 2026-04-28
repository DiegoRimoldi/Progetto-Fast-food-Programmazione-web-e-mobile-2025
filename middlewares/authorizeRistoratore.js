/**
 * Analisi file: authorizeRistoratore.js.
 * Questo modulo gestisce una parte specifica dell'applicazione Fast Food.
 */
// Esegue: const authorizeRistoratore = (req, res, next) => {
const authorizeRistoratore = (req, res, next) => {
    // Esegue: if (req.user.role !== "ristoratore") {
    if (req.user.role !== "ristoratore") {
      // Esegue: return res.status(403).json({ error: "Accesso consentito solo ai ristoratori" });
      return res.status(403).json({ error: "Accesso consentito solo ai ristoratori" });
    // Esegue: }
    }
    // Esegue: next();
    next();
  // Esegue: };
  };
  
  // Esegue: export default authorizeRistoratore;
  export default authorizeRistoratore;
  
