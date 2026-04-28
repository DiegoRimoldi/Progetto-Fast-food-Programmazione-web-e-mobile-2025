/**
 * Analisi file: meals.js.
 * Questo modulo gestisce una parte specifica dell'applicazione Fast Food.
 */
// Esegue: import express from "express";
import express from "express";
// Esegue: import { ObjectId } from "mongodb";
import { ObjectId } from "mongodb";
// Esegue: import authenticateUser from "../middlewares/authenticateUser.js";
import authenticateUser from "../middlewares/authenticateUser.js";
// Esegue: import authorizeRistoratore from "../middlewares/authorizeRistoratore.js";
import authorizeRistoratore from "../middlewares/authorizeRistoratore.js";

// Esegue: const mealsRouter = express.Router();
const mealsRouter = express.Router();

// Esegue: function parseCsv(value) {
function parseCsv(value) {
  // Esegue: return String(value)
  return String(value)
    // Esegue: .split(",")
    .split(",")
    // Esegue: .map((item) => item.trim())
    .map((item) => item.trim())
    // Esegue: .filter(Boolean);
    .filter(Boolean);
// Esegue: }
}

// GET /meals - Restituisce tutti i piatti, con filtri opzionali
// Esegue: mealsRouter.get("/", async (req, res) => {
mealsRouter.get("/", async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const {
    const {
      // Esegue: strCategory,
      strCategory,
      // Esegue: strArea,
      strArea,
      // Esegue: nome,
      nome,
      // Esegue: prezzoMin,
      prezzoMin,
      // Esegue: prezzoMax,
      prezzoMax,
      // Esegue: ristorante_id,
      ristorante_id,
      // Esegue: ingredients,
      ingredients,
      // Esegue: allergens
      allergens
    // Esegue: } = req.query;
    } = req.query;

    // Esegue: const filter = {};
    const filter = {};

    // Esegue: if (strCategory) filter.strCategory = strCategory;
    if (strCategory) {
      if (Array.isArray(strCategory)) {
        filter.strCategory = { $in: strCategory.filter(Boolean) };
      } else {
        filter.strCategory = strCategory;
      }
    }
    // Esegue: if (strArea) filter.strArea = strArea;
    if (strArea) filter.strArea = strArea;
    // Esegue: if (nome) {
    if (nome) {
      // Esegue: filter.strMeal = { $regex: nome, $options: "i" };
      filter.strMeal = { $regex: nome, $options: "i" };
    // Esegue: }
    }
    // Esegue: if (prezzoMin || prezzoMax) {
    if (prezzoMin || prezzoMax) {
      // Esegue: filter.prezzo = {};
      filter.prezzo = {};
      // Esegue: if (prezzoMin) filter.prezzo.$gte = parseFloat(prezzoMin);
      if (prezzoMin) filter.prezzo.$gte = parseFloat(prezzoMin);
      // Esegue: if (prezzoMax) filter.prezzo.$lte = parseFloat(prezzoMax);
      if (prezzoMax) filter.prezzo.$lte = parseFloat(prezzoMax);
    // Esegue: }
    }
    // Esegue: if (ristorante_id) {
    if (ristorante_id) {
      // Esegue: if (!ObjectId.isValid(ristorante_id)) {
      if (!ObjectId.isValid(ristorante_id)) {
        // Esegue: return res.status(400).json({ error: "ristorante_id non valido" });
        return res.status(400).json({ error: "ristorante_id non valido" });
      // Esegue: }
      }
      // Esegue: filter.ristorante_id = new ObjectId(ristorante_id);
      filter.ristorante_id = new ObjectId(ristorante_id);
    // Esegue: }
    }

    // Esegue: if (ingredients) {
    if (ingredients) {
      // Esegue: const ingredientsList = parseCsv(ingredients);
      const ingredientsList = parseCsv(ingredients);
      // Esegue: filter.ingredients = {
      filter.ingredients = {
        // Esegue: $all: ingredientsList.map((i) => new RegExp(`^${i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"))
        $all: ingredientsList.map((i) => new RegExp(`^${i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"))
      // Esegue: };
      };
    // Esegue: }
    }

    // Esegue: if (allergens) {
    if (allergens) {
      // Esegue: const allergensList = parseCsv(allergens);
      const allergensList = parseCsv(allergens);
      // Esegue: filter.ingredients = {
      filter.ingredients = {
        // Esegue: ...(filter.ingredients || {}),
        ...(filter.ingredients || {}),
        // Esegue: $not: {
        $not: {
          // Esegue: $elemMatch: {
          $elemMatch: {
            // Esegue: $in: allergensList.map((a) => new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"))
            $in: allergensList.map((a) => new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"))
          // Esegue: }
          }
        // Esegue: }
        }
      // Esegue: };
      };
    // Esegue: }
    }

    // Esegue: const meals = await db.collection("meals").find(filter).toArray();
    const meals = await db.collection("meals").find(filter).toArray();

    // Esegue: res.json(meals);
    res.json(meals);
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: res.status(500).json({ error: "Errore nel recupero dei piatti" });
    res.status(500).json({ error: "Errore nel recupero dei piatti" });
  // Esegue: }
  }
// Esegue: });
});


// GET /meals/:id - Dettagli singolo piatto, identificato per _id
// Esegue: mealsRouter.get("/:id", async (req, res) => {
mealsRouter.get("/:id", async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const { id } = req.params;
    const { id } = req.params;

    // Esegue: if (!ObjectId.isValid(id)) {
    if (!ObjectId.isValid(id)) {
      // Esegue: return res.status(400).json({ error: "ID non valido" });
      return res.status(400).json({ error: "ID non valido" });
    // Esegue: }
    }

    // Esegue: const meal = await db.collection("meals").findOne({ _id: new ObjectId(id) });
    const meal = await db.collection("meals").findOne({ _id: new ObjectId(id) });

    // Esegue: if (!meal) {
    if (!meal) {
      // Esegue: return res.status(404).json({ error: "Piatto non trovato" });
      return res.status(404).json({ error: "Piatto non trovato" });
    // Esegue: }
    }

    // Esegue: res.json(meal);
    res.json(meal);
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: res.status(500).json({ error: "Errore nel recupero del piatto" });
    res.status(500).json({ error: "Errore nel recupero del piatto" });
  // Esegue: }
  }
// Esegue: });
});


// POST /meals - Aggiunta piatto personalizzato (Richiede autenticazione utente ristoratore)
// Esegue: mealsRouter.post("/", authenticateUser, authorizeRistoratore, async (req, res) => {
mealsRouter.post("/", authenticateUser, authorizeRistoratore, async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const user = req.user;
    const user = req.user;

    // Esegue: const restaurant = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user...
    const restaurant = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user._id) });

    // Esegue: if (!restaurant) {
    if (!restaurant) {
      // Esegue: return res.status(403).json({ error: "Devi prima creare un ristorante per poter aggiungere piatti...
      return res.status(403).json({ error: "Devi prima creare un ristorante per poter aggiungere piatti" });
    // Esegue: }
    }

    // Esegue: const {
    const {
      // Esegue: strMeal,
      strMeal,
      // Esegue: strCategory,
      strCategory,
      // Esegue: strArea,
      strArea,
      // Esegue: strInstructions,
      strInstructions,
      // Esegue: strMealThumb,
      strMealThumb,
      // Esegue: ingredients,
      ingredients,
      // Esegue: measures,
      measures,
      // Esegue: prezzo,
      prezzo,
      // Esegue: tempo_preparazione,
      tempo_preparazione,
    // Esegue: } = req.body;
    } = req.body;

    // Esegue: if (!strMeal || typeof strMeal !== "string") {
    if (!strMeal || typeof strMeal !== "string") {
      // Esegue: return res.status(400).json({ error: "strMeal richiesto e stringa" });
      return res.status(400).json({ error: "strMeal richiesto e stringa" });
    // Esegue: }
    }

    // Esegue: if (!Array.isArray(ingredients) || ingredients.length === 0) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      // Esegue: return res.status(400).json({ error: "ingredients deve essere un array non vuoto" });
      return res.status(400).json({ error: "ingredients deve essere un array non vuoto" });
    // Esegue: }
    }

    // Esegue: if (!Array.isArray(measures) || measures.length !== ingredients.length) {
    if (!Array.isArray(measures) || measures.length !== ingredients.length) {
      // Esegue: return res.status(400).json({ error: "measures deve essere un array della stessa lunghezza di ing...
      return res.status(400).json({ error: "measures deve essere un array della stessa lunghezza di ingredients" });
    // Esegue: }
    }

    // Esegue: if (typeof prezzo !== "number" || prezzo < 0) {
    if (typeof prezzo !== "number" || prezzo < 0) {
      // Esegue: return res.status(400).json({ error: "prezzo richiesto e deve essere un numero >= 0" });
      return res.status(400).json({ error: "prezzo richiesto e deve essere un numero >= 0" });
    // Esegue: }
    }

    // Esegue: if (typeof tempo_preparazione !== "number" || tempo_preparazione < 0) {
    if (typeof tempo_preparazione !== "number" || tempo_preparazione < 0) {
      // Esegue: return res.status(400).json({ error: "tempo_preparazione richiesto e deve essere un numero >= 0" });
      return res.status(400).json({ error: "tempo_preparazione richiesto e deve essere un numero >= 0" });
    // Esegue: }
    }

    // Esegue: const newMeal = {
    const newMeal = {
      // Esegue: strMeal,
      strMeal,
      // Esegue: strCategory,
      strCategory,
      // Esegue: strArea,
      strArea,
      // Esegue: strInstructions,
      strInstructions,
      // Esegue: strMealThumb,
      strMealThumb,
      // Esegue: ingredients,
      ingredients,
      // Esegue: measures,
      measures,
      // Esegue: prezzo,
      prezzo,
      // Esegue: tempo_preparazione,
      tempo_preparazione,
      // Esegue: ristorante_id: restaurant._id,
      ristorante_id: restaurant._id,
    // Esegue: };
    };

    // Esegue: const result = await db.collection("meals").insertOne(newMeal);
    const result = await db.collection("meals").insertOne(newMeal);

    // Esegue: await db.collection("restaurants").updateOne(
    await db.collection("restaurants").updateOne(
      // Esegue: { _id: restaurant._id },
      { _id: restaurant._id },
      // Esegue: { $push: { menu: result.insertedId } }
      { $push: { menu: result.insertedId } }
    // Esegue: );
    );

    // Esegue: res.status(201).json({ ...newMeal, _id: result.insertedId });
    res.status(201).json({ ...newMeal, _id: result.insertedId });
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: res.status(500).json({ error: "Errore nella creazione del piatto" });
    res.status(500).json({ error: "Errore nella creazione del piatto" });
  // Esegue: }
  }
// Esegue: });
});



// PUT /meals/:id - Modifica piatto personalizzato (Richiede autenticazione utente ristoratore)
// Esegue: mealsRouter.put("/:id", authenticateUser, authorizeRistoratore, async (req, res) => {
mealsRouter.put("/:id", authenticateUser, authorizeRistoratore, async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const user = req.user;
    const user = req.user;
    // Esegue: const id = req.params.id;
    const id = req.params.id;
    // Esegue: let meal;
    let meal;

    // Esegue: const restaurant = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user...
    const restaurant = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user._id) });

    // Esegue: if (!restaurant) {
    if (!restaurant) {
      // Esegue: return res.status(403).json({ error: "Devi prima creare un ristorante" });
      return res.status(403).json({ error: "Devi prima creare un ristorante" });
    // Esegue: }
    }

    // Esegue: if (ObjectId.isValid(id)) {
    if (ObjectId.isValid(id)) {
      // Esegue: meal = await db.collection("meals").findOne({ _id: new ObjectId(id) });
      meal = await db.collection("meals").findOne({ _id: new ObjectId(id) });
    // Esegue: }
    }

    // Esegue: if (!meal) {
    if (!meal) {
      // Esegue: return res.status(404).json({ error: "Piatto non trovato" });
      return res.status(404).json({ error: "Piatto non trovato" });
    // Esegue: }
    }

    // Esegue: if (!meal.ristorante_id) {
    if (!meal.ristorante_id) {
      // Esegue: return res.status(403).json({ error: "Impossibile modificare piatti generali" });
      return res.status(403).json({ error: "Impossibile modificare piatti generali" });
    // Esegue: }
    }

    // un ristoratore può modificare solo i piatti personalizzati del proprio ristorante
    // Esegue: if (meal.ristorante_id.toString() !== restaurant._id.toString()) {
    if (meal.ristorante_id.toString() !== restaurant._id.toString()) {
      // Esegue: return res.status(403).json({ error: "Accesso negato: non proprietario del piatto" });
      return res.status(403).json({ error: "Accesso negato: non proprietario del piatto" });
    // Esegue: }
    }

    // Esegue: const allowedFields = [
    const allowedFields = [
      // Esegue: "strMeal", "strCategory", "strArea", "strInstructions",
      "strMeal", "strCategory", "strArea", "strInstructions",
      // Esegue: "strMealThumb", "ingredients", "measures",
      "strMealThumb", "ingredients", "measures",
      // Esegue: "prezzo", "tempo_preparazione"
      "prezzo", "tempo_preparazione"
    // Esegue: ];
    ];

    // Esegue: const updateFields = {};
    const updateFields = {};

    // Esegue: for (const field of allowedFields) {
    for (const field of allowedFields) {
      // Esegue: if (req.body[field] !== undefined) {
      if (req.body[field] !== undefined) {
        // Esegue: updateFields[field] = req.body[field];
        updateFields[field] = req.body[field];
      // Esegue: }
      }
    // Esegue: }
    }

    // Esegue: if ("ingredients" in updateFields && !Array.isArray(updateFields.ingredients)) {
    if ("ingredients" in updateFields && !Array.isArray(updateFields.ingredients)) {
      // Esegue: return res.status(400).json({ error: "ingredients deve essere un array" });
      return res.status(400).json({ error: "ingredients deve essere un array" });
    // Esegue: }
    }

    // Esegue: if ("measures" in updateFields && !Array.isArray(updateFields.measures)) {
    if ("measures" in updateFields && !Array.isArray(updateFields.measures)) {
      // Esegue: return res.status(400).json({ error: "measures deve essere un array" });
      return res.status(400).json({ error: "measures deve essere un array" });
    // Esegue: }
    }

    // Esegue: if (Object.keys(updateFields).length === 0) {
    if (Object.keys(updateFields).length === 0) {
      // Esegue: return res.status(400).json({ error: "Nessun campo valido da aggiornare" });
      return res.status(400).json({ error: "Nessun campo valido da aggiornare" });
    // Esegue: }
    }

    // Esegue: const result = await db.collection("meals").updateOne(
    const result = await db.collection("meals").updateOne(
      // Esegue: { _id: new ObjectId(id) },
      { _id: new ObjectId(id) },
      // Esegue: { $set: updateFields }
      { $set: updateFields }
    // Esegue: );
    );

    // Esegue: if (result.matchedCount === 0) {
    if (result.matchedCount === 0) {
      // Esegue: return res.status(404).json({ error: "Piatto non trovato" });
      return res.status(404).json({ error: "Piatto non trovato" });
    // Esegue: }
    }

    // Esegue: res.json(await db.collection("meals").findOne({ _id: new ObjectId(id) }));
    res.json(await db.collection("meals").findOne({ _id: new ObjectId(id) }));
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: res.status(500).json({ error: "Errore interno del server" });
    res.status(500).json({ error: "Errore interno del server" });
  // Esegue: }
  }
// Esegue: });
});


// DELETE /meals/:id - Elimina piatto personalizzato (Richiede autenticazione utente ristoratore)
// Esegue: mealsRouter.delete("/:id", authenticateUser, authorizeRistoratore, async (req, res) => {
mealsRouter.delete("/:id", authenticateUser, authorizeRistoratore, async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const user = req.user;
    const user = req.user;
    // Esegue: const id = req.params.id;
    const id = req.params.id;

    // Esegue: if (!ObjectId.isValid(id)) return res.status(400).json({ error: "ID non valido" });
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "ID non valido" });

    // Esegue: const meal = await db.collection("meals").findOne({ _id: new ObjectId(id) });
    const meal = await db.collection("meals").findOne({ _id: new ObjectId(id) });

    // Esegue: if (!meal) return res.status(404).json({ error: "Piatto non trovato" });
    if (!meal) return res.status(404).json({ error: "Piatto non trovato" });

    // Esegue: if (!meal.ristorante_id) {
    if (!meal.ristorante_id) {
      // Esegue: return res.status(403).json({ error: "Impossibile eliminare piatti generali" });
      return res.status(403).json({ error: "Impossibile eliminare piatti generali" });
    // Esegue: }
    }

    // Esegue: const restaurant = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user...
    const restaurant = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user._id) });
    // Esegue: if (!restaurant) {
    if (!restaurant) {
      // Esegue: return res.status(404).json({ error: "Ristorante non trovato" });
      return res.status(404).json({ error: "Ristorante non trovato" });
    // Esegue: }
    }

    // Esegue: if (!user || user.role !== "ristoratore" || meal.ristorante_id.toString() !== restaurant._id.toSt...
    if (!user || user.role !== "ristoratore" || meal.ristorante_id.toString() !== restaurant._id.toString()) {
      // Esegue: return res.status(403).json({ error: "Accesso negato: non proprietario del piatto" });
      return res.status(403).json({ error: "Accesso negato: non proprietario del piatto" });
    // Esegue: }
    }

    // Esegue: const result = await db.collection("meals").deleteOne({ _id: new ObjectId(id) });
    const result = await db.collection("meals").deleteOne({ _id: new ObjectId(id) });

    // Esegue: if (result.deletedCount === 0) return res.status(404).json({ error: "Piatto non trovato" });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Piatto non trovato" });

    // Esegue: await db.collection("restaurants").updateOne(
    await db.collection("restaurants").updateOne(
      // Esegue: { _id: restaurant._id },
      { _id: restaurant._id },
      // Esegue: { $pull: { menu: new ObjectId(id) } }
      { $pull: { menu: new ObjectId(id) } }
    // Esegue: );
    );

    // Esegue: res.status(204).end();
    res.status(204).end();
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: res.status(500).json({ error: "Errore nell'eliminazione del piatto" });
    res.status(500).json({ error: "Errore nell'eliminazione del piatto" });
  // Esegue: }
  }
// Esegue: });
});

// Esegue: export default mealsRouter;
export default mealsRouter;
