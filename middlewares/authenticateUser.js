/**
 * Analisi file: authenticateUser.js.
 * Questo modulo gestisce una parte specifica dell'applicazione Fast Food.
 */
// Esegue: import jwt from "jsonwebtoken";
import jwt from "jsonwebtoken";

// Esegue: const authenticateUser = (req, res, next) => {
const authenticateUser = (req, res, next) => {
  // Esegue: try {
  try {
    // Esegue: const authHeader = req.headers.authorization;
    const authHeader = req.headers.authorization;
    // Esegue: if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Esegue: return res.status(401).json({ error: "Token mancante o formato non valido" });
      return res.status(401).json({ error: "Token mancante o formato non valido" });
    // Esegue: }
    }
    // Esegue: const token = authHeader.split(" ")[1];
    const token = authHeader.split(" ")[1];

    // Esegue: console.log("Token ricevuto:", token);
    console.log("Token ricevuto:", token);
    // Esegue: console.log("Chiave segreta (env):", process.env.JWT_SECRET);
    console.log("Chiave segreta (env):", process.env.JWT_SECRET);

    // Esegue: const payload = jwt.verify(token, process.env.JWT_SECRET);
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Esegue: console.log("Payload decodificato:", payload);
    console.log("Payload decodificato:", payload);

    // Esegue: if (!payload.userId || !payload.role) {
    if (!payload.userId || !payload.role) {
      // Esegue: return res.status(401).json({ error: "Token non valido: mancano dati utente" });
      return res.status(401).json({ error: "Token non valido: mancano dati utente" });
    // Esegue: }
    }

    // Esegue: req.user = { _id: payload.userId, role: payload.role };
    req.user = { _id: payload.userId, role: payload.role };
    // Esegue: next();
    next();
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error("Errore verifica JWT:", err.message);
    console.error("Errore verifica JWT:", err.message);
    // Esegue: return res.status(401).json({ error: "Token non valido o scaduto" });
    return res.status(401).json({ error: "Token non valido o scaduto" });
  // Esegue: }
  }
// Esegue: };
};

// Esegue: export default authenticateUser;
export default authenticateUser;
