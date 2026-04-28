import dotenv from "dotenv";
// dotenv è un modulo che permette il caricamento di variabili d'ambiente da un file .env
// Le variabili d'ambiente vengono memorizzate nell'oggetto globale process.env in Node.js

dotenv.config(); //estrae i valori dal file .env, e li carica nelle variabili d'ambiente process.env

const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "JWT_EXPIRES_IN"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Variabili d'ambiente mancanti: ${missingEnvVars.join(", ")}. ` +
    "Configura un file .env valido prima di avviare il server."
  );
}

const config = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
};

export default config;
