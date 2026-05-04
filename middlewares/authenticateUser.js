/*
  Middleware di autenticazione JWT.
  Verifica presenza e validità del token, ricava l'utente autenticato
  e arricchisce req con le informazioni necessarie alle route protette.
*/

// SEZIONE: Import dei moduli necessari al file.
import jwt from "jsonwebtoken";

// SEZIONE: Dichiarazione di costanti, middleware locali o oggetti di supporto.
const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token mancante o formato non valido" });
    }
    const token = authHeader.split(" ")[1];

    console.log("Token ricevuto:", token);
    console.log("Chiave segreta (env):", process.env.JWT_SECRET);

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Payload decodificato:", payload);

    if (!payload.userId || !payload.role) {
      return res.status(401).json({ error: "Token non valido: mancano dati utente" });
    }

    req.user = { _id: payload.userId, role: payload.role };
    next();
  } catch (err) {
    console.error("Errore verifica JWT:", err.message);
    return res.status(401).json({ error: "Token non valido o scaduto" });
  }
};


// SEZIONE EXPORT: Esportiamo il modulo per renderlo riutilizzabile nel progetto.
export default authenticateUser;
