/**
 * Analisi file: index.js.
 * Questo modulo gestisce una parte specifica dell'applicazione Fast Food.
 */
// Esegue: import express from "express";
import express from "express";
// Esegue: import { MongoClient } from "mongodb";
import { MongoClient } from "mongodb";
// Esegue: import config from "./utils/config.js";
import config from "./utils/config.js";
// Esegue: import usersRouter from "./routes/users.js";
import usersRouter from "./routes/users.js";
// Esegue: import mealsRouter from "./routes/meals.js";
import mealsRouter from "./routes/meals.js";
// Esegue: import restaurantsRouter from "./routes/restaurants.js";
import restaurantsRouter from "./routes/restaurants.js";
// Esegue: import ordersRouter from "./routes/orders.js";
import ordersRouter from "./routes/orders.js";
// Esegue: import cartsRouter from "./routes/carts.js";
import cartsRouter from "./routes/carts.js";
// Esegue: import cors from "cors";
import cors from "cors";
// Esegue: import swaggerUi from "swagger-ui-express";
import swaggerUi from "swagger-ui-express";
// Esegue: import fs from "fs";
import fs from "fs";
// Esegue: import path from "path";
import path from "path";
// Esegue: import { fileURLToPath } from "url";
import { fileURLToPath } from "url";
// Esegue: import { ObjectId } from "mongodb";
import { ObjectId } from "mongodb";

// Esegue: const swaggerDocument = JSON.parse(fs.readFileSync("./Documents/swagger.json", "utf-8"));
const swaggerDocument = JSON.parse(fs.readFileSync("./Documents/swagger.json", "utf-8"));
// Esegue: const __filename = fileURLToPath(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
// Esegue: const __dirname = path.dirname(__filename);
const __dirname = path.dirname(__filename);

// Esegue: const app = express();
const app = express();

// Esegue: app.use(express.json());
app.use(express.json());
// Esegue: app.use(cors());
app.use(cors());
// Esegue: app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));

// Esegue: app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Esegue: function normalizeMealDocument(meal) {
function normalizeMealDocument(meal) {
  // Esegue: const normalized = { ...meal };
  const normalized = { ...meal };
  // Esegue: if (meal?._id?.$oid && ObjectId.isValid(meal._id.$oid)) {
  if (meal?._id?.$oid && ObjectId.isValid(meal._id.$oid)) {
    // Esegue: normalized._id = new ObjectId(meal._id.$oid);
    normalized._id = new ObjectId(meal._id.$oid);
  // Esegue: } else {
  } else {
    // Esegue: delete normalized._id;
    delete normalized._id;
  // Esegue: }
  }
  // Esegue: return normalized;
  return normalized;
// Esegue: }
}

// Esegue: async function bootstrapInitialMeals(db) {
async function bootstrapInitialMeals(db) {
  // Esegue: const mealsCollection = db.collection("meals");
  const mealsCollection = db.collection("meals");
  // Esegue: const mealsCount = await mealsCollection.estimatedDocumentCount();
  const mealsCount = await mealsCollection.estimatedDocumentCount();
  // Esegue: if (mealsCount > 0) return;
  if (mealsCount > 0) return;

  // Esegue: const rawMeals = JSON.parse(fs.readFileSync("./Documents/meals.json", "utf-8"));
  const rawMeals = JSON.parse(fs.readFileSync("./Documents/meals.json", "utf-8"));
  // Esegue: const normalizedMeals = Array.isArray(rawMeals) ? rawMeals.map(normalizeMealDocument) : [];
  const normalizedMeals = Array.isArray(rawMeals) ? rawMeals.map(normalizeMealDocument) : [];
  // Esegue: if (normalizedMeals.length === 0) return;
  if (normalizedMeals.length === 0) return;

  // Esegue: await mealsCollection.insertMany(normalizedMeals, { ordered: false });
  await mealsCollection.insertMany(normalizedMeals, { ordered: false });
  // Esegue: console.log(`Bootstrap completato: caricati ${normalizedMeals.length} piatti iniziali da Document...
  console.log(`Bootstrap completato: caricati ${normalizedMeals.length} piatti iniziali da Documents/meals.json`);
// Esegue: }
}

// Esegue: async function startServer() {
async function startServer() {
  // Esegue: try {
  try {
    // Esegue: const client = new MongoClient(config.MONGODB_URI);
    const client = new MongoClient(config.MONGODB_URI);
    // Esegue: await client.connect();
    await client.connect();
    // Esegue: app.locals.db = client.db("Fast-Food");
    app.locals.db = client.db("Fast-Food");
    // Esegue: await bootstrapInitialMeals(app.locals.db);
    await bootstrapInitialMeals(app.locals.db);

    // Esegue: app.get("/", (req, res) => {
    app.get("/", (req, res) => {
      // Esegue: res.sendFile(path.join(__dirname, "public", "index.html"));
      res.sendFile(path.join(__dirname, "public", "index.html"));
    // Esegue: });
    });

    // Esegue: app.use("/users", usersRouter);
    app.use("/users", usersRouter);
    // Esegue: app.use("/meals", mealsRouter);
    app.use("/meals", mealsRouter);
    // Esegue: app.use("/restaurants", restaurantsRouter);
    app.use("/restaurants", restaurantsRouter);
    // Esegue: app.use("/orders", ordersRouter);
    app.use("/orders", ordersRouter);
    // Esegue: app.use("/carts", cartsRouter);
    app.use("/carts", cartsRouter);

    // Esegue: app.use((err, req, res, next) => {
    app.use((err, req, res, next) => {
      // Esegue: console.error("Errore:", err.message);
      console.error("Errore:", err.message);
      // Esegue: res.status(err.status || 500).json({ error: err.message });
      res.status(err.status || 500).json({ error: err.message });
    // Esegue: });
    });

    // Esegue: const PORT = config.PORT;
    const PORT = config.PORT;
    // Esegue: app.listen(PORT, () => {
    app.listen(PORT, () => {
      // Esegue: console.log(`Server avviato su http://localhost:${PORT}`);
      console.log(`Server avviato su http://localhost:${PORT}`);
    // Esegue: });
    });
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error("Errore durante la connessione a MongoDB:", err.message);
    console.error("Errore durante la connessione a MongoDB:", err.message);
    // Esegue: process.exit(1);
    process.exit(1);
  // Esegue: }
  }
// Esegue: }
}

// Esegue: startServer();
startServer();
