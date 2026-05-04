/*
  Modulo di configurazione applicativa.
  Centralizza variabili d'ambiente e costanti runtime
  per evitare valori hardcoded sparsi nei vari moduli.
*/

// SEZIONE: Import dei moduli necessari al file.
import dotenv from "dotenv";

dotenv.config();

function extractDbNameFromMongoUri(uri) {
  if (!uri) return null;

  try {
    // SEZIONE: Dichiarazione di costanti, middleware locali o oggetti di supporto.
const parsed = new URL(uri);
    const dbName = parsed.pathname?.replace(/^\//, "").split("/")[0];
    return dbName || null;
  } catch {
    return null;
  }
}

const mongodbUri = process.env.MONGODB_URI;
const mongodbDb = process.env.MONGODB_DB || extractDbNameFromMongoUri(mongodbUri);

const requiredEnvVars = [
  ["MONGODB_URI", mongodbUri],
  ["MONGODB_DB", mongodbDb],
  ["JWT_SECRET", process.env.JWT_SECRET],
  ["JWT_EXPIRES_IN", process.env.JWT_EXPIRES_IN],
];

const missingEnvVars = requiredEnvVars.filter(([, value]) => !value).map(([key]) => key);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Variabili d'ambiente mancanti: ${missingEnvVars.join(", ")}. ` +
      "Configura un file .env valido prima di avviare il server."
  );
}

const config = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: mongodbUri,
  MONGODB_DB: mongodbDb,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
};


// SEZIONE EXPORT: Esportiamo il modulo per renderlo riutilizzabile nel progetto.
export default config;
