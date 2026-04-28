/**
 * Analisi file: config.js.
 * Questo modulo gestisce una parte specifica dell'applicazione Fast Food.
 */
// Esegue: import dotenv from "dotenv";
import dotenv from "dotenv";
// dotenv è un modulo che permette il caricamento di variabili d'ambiente da un file .env
// Le variabili d'ambiente vengono memorizzate nell'oggetto globale process.env in Node.js

// Esegue: dotenv.config(); //estrae i valori dal file .env, e li carica nelle variabili d'ambiente process.env
dotenv.config(); //estrae i valori dal file .env, e li carica nelle variabili d'ambiente process.env

// Esegue: const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "JWT_EXPIRES_IN"];
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "JWT_EXPIRES_IN"];
// Esegue: const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

// Esegue: if (missingEnvVars.length > 0) {
if (missingEnvVars.length > 0) {
  // Esegue: throw new Error(
  throw new Error(
    // Esegue: `Variabili d'ambiente mancanti: ${missingEnvVars.join(", ")}. ` +
    `Variabili d'ambiente mancanti: ${missingEnvVars.join(", ")}. ` +
    // Esegue: "Configura un file .env valido prima di avviare il server."
    "Configura un file .env valido prima di avviare il server."
  // Esegue: );
  );
// Esegue: }
}

// Esegue: const config = {
const config = {
  // Esegue: PORT: process.env.PORT || 3000,
  PORT: process.env.PORT || 3000,
  // Esegue: MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_URI: process.env.MONGODB_URI,
  // Esegue: JWT_SECRET: process.env.JWT_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  // Esegue: JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
// Esegue: };
};

// Esegue: export default config;
export default config;
