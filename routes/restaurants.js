import express from "express";
import { ObjectId } from "mongodb";
import authenticateUser from "../middlewares/authenticateUser.js";
import authorizeRistoratore from "../middlewares/authorizeRistoratore.js";

const router = express.Router();

/**
 * GET /restaurants/search
 * Ricerca ristoranti per nome e indirizzo (parziale, case insensitive)
 * Query params:
 *  - q: stringa da cercare nel nome
 *  - address: stringa da cercare nell'indirizzo
 */
router.get("/search", async (req, res) => {
  const db = req.app.locals.db;
  const { q, address } = req.query;

  const filter = {};

  if (q) {
    filter.name = { $regex: q, $options: "i" };
  }

  if (address) {
    filter.address = { $regex: address, $options: "i" };
  }

  try {
    const restaurants = await db.collection("restaurants")
      .find(filter)
      .toArray();

    res.json({ total: restaurants.length, restaurants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella ricerca ristoranti" });
  }
});



/**
 * GET /restaurants/by-meal
 * Ricerca ristoranti che hanno nel menu un piatto che matcha il nome richiesto
 * Query params:
 *  - meal: stringa da cercare nel nome del piatto
 */
router.get("/by-meal", async (req, res) => {
  const db = req.app.locals.db;
  const { meal } = req.query;

  if (!meal) {
    return res.status(400).json({ error: "Parametro 'meal' obbligatorio" });
  }

  try {
    const meals = await db.collection("meals").find({
      strMeal: { $regex: meal, $options: "i" }
    }, { projection: { _id: 1, strMeal: 1, ristorante_id: 1 } }).toArray();

    if (meals.length === 0) {
      return res.json({ total: 0, restaurants: [] });
    }

    const restaurantIds = [...new Set(meals
      .map((m) => m.ristorante_id)
      .filter(Boolean)
      .map((id) => id.toString()))]
      .map((id) => new ObjectId(id));

    const restaurants = await db.collection("restaurants").find({ _id: { $in: restaurantIds } }).toArray();

    const mealsByRestaurant = meals.reduce((acc, m) => {
      if (!m.ristorante_id) return acc;
      const key = m.ristorante_id.toString();
      acc[key] = acc[key] || [];
      acc[key].push({ _id: m._id, strMeal: m.strMeal });
      return acc;
    }, {});

    const enrichedRestaurants = restaurants.map((r) => ({
      ...r,
      matchingMeals: mealsByRestaurant[r._id.toString()] || []
    }));

    res.json({ total: enrichedRestaurants.length, restaurants: enrichedRestaurants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella ricerca ristoranti per piatto" });
  }
});

//GET /restaurants - Lista ristoranti registrati
router.get("/", async (req, res) => {
  const db = req.app.locals.db;
  try {
    const restaurants = await db.collection("restaurants").find({}).toArray();
    res.json(restaurants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero dei ristoranti" });
  }
});


// GET /restaurants/statistics - Statistiche ristorante (Richiede autenticazione ristoratore)
router.get("/statistics", authenticateUser, authorizeRistoratore, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = req.user;

    const ristorante = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user._id) });

    if (!ristorante) {
      return res.status(404).json({ error: "Ristorante non trovato" });
    }

    const orders = await db.collection("orders").find({ ristorante_id: new ObjectId(ristorante._id) }).toArray();

    let totalOrders = orders.length;
    let totalRevenue = 0;
    let ordersByState = {};
    let mealCount = {};
    let ordersTrend = {};

    orders.forEach(({ totale, stato, meals, data_ordine }) => {
      totalRevenue += totale;
      ordersByState[stato] = (ordersByState[stato] || 0) + 1;
      meals.forEach(({ nome, quantita }) => mealCount[nome] = (mealCount[nome] || 0) + quantita);
      let date = data_ordine.split(" - ")[0];
      ordersTrend[date] = (ordersTrend[date] || 0) + 1;
    });

    res.json({
      totalOrders,
      totalRevenue,
      ordersByState,
      topMeals: Object.entries(mealCount).sort((a, b) => b[1] - a[1]).slice(0, 5),
      ordersTrend
    });

  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero delle statistiche" });
  }
});

//GET /restaurants/:restaurantID - Informazioni di uno specifico ristorante, menu incluso
router.get("/:restaurantId", async (req, res) => {
  const db = req.app.locals.db;
  const restaurantId = req.params.restaurantId;

  if (!ObjectId.isValid(restaurantId)) {
    return res.status(400).json({ error: "ID ristorante non valido" });
  }

  try {
    const restaurant = await db.collection("restaurants").findOne({ _id: new ObjectId(restaurantId) });
    if (!restaurant) {
      return res.status(404).json({ error: "Ristorante non trovato" });
    }
    const mealIds = Array.isArray(restaurant.menu) 
    ? restaurant.menu.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id))
    : [];
    const meals = await db.collection("meals").find({ _id: { $in: mealIds } }).toArray();

    res.json({ ...restaurant, meals: meals });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero del ristorante" });
  }
});


// POST /restaurants - Crea un nuovo ristorante (Richiede autenticazione ristoratore)
router.post("/", authenticateUser, authorizeRistoratore, async (req, res) => {
  const db = req.app.locals.db;
  const user = req.user;
  const { name, address, numero_di_telefono, piva, menu, description, image } = req.body;
  if (!name || !address || !numero_di_telefono) {
    return res.status(400).json({ error: "Nome, indirizzo e numero di telefono sono obbligatori" });
  }

  try {
    const existingRestaurant = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user._id) });
    if (existingRestaurant) {
      return res.status(400).json({ error: "Hai già un ristorante associato" });
    }

    const ristoratore = await db.collection("users").findOne({ _id: new ObjectId(user._id) });
    const partitaIva = piva || ristoratore?.piva;
    if (!partitaIva) {
      return res.status(400).json({ error: "Partita IVA obbligatoria per creare un ristorante" });
    }

    const newRestaurant = {
      name,
      address,
      numero_di_telefono,
      piva: partitaIva,
      description,
      image,
      menu,
      ristoratore_id: new ObjectId(user._id)
    };

    const result = await db.collection("restaurants").insertOne(newRestaurant);
    res.status(201).json({ ...newRestaurant, _id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella creazione del ristorante" });
  }
});

//PUT /restaurants/:restaurantId - Modifica dati ristorante (Richiede autenticazione ristoratore)
router.put("/:restaurantId", authenticateUser, authorizeRistoratore, async (req, res) => {
  const db = req.app.locals.db;
  const user = req.user;
  const restaurantId = req.params.restaurantId;
  const { name, address, numero_di_telefono, piva, menu, description, image } = req.body;
  if (!ObjectId.isValid(restaurantId)) {
    return res.status(400).json({ error: "ID ristorante non valido" });
  }

  try {
    const restaurant = await db.collection("restaurants").findOne({ _id: new ObjectId(restaurantId) });
    if (!restaurant) {
      return res.status(404).json({ error: "Ristorante non trovato" });
    }

    if (restaurant.ristoratore_id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "Accesso negato: non proprietario del ristorante" });
    }

    const updateDoc={};

    if (name) updateDoc.name = name;
    if (address) updateDoc.address = address;
    if (numero_di_telefono) updateDoc.numero_di_telefono = numero_di_telefono;
    if (piva) updateDoc.piva = piva;
    if (menu) updateDoc.menu = menu;
    if (description) updateDoc.description = description;
    if (image) updateDoc.image = image;

    await db.collection("restaurants").updateOne(
      { _id: new ObjectId(restaurantId) },
      { $set: updateDoc }
    );

    const updatedRestaurant = await db.collection("restaurants").findOne({ _id: new ObjectId(restaurantId) });
    res.json(updatedRestaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella modifica del ristorante" });
  }
});

//DELETE /restaurants/:restaurantId - Elimina ristorante, tutti gli ordini e tutti i piatti personalizzati associati (Richiede autenticazione ristoratore)
router.delete("/:restaurantId", authenticateUser, authorizeRistoratore, async (req, res) => {
  const db = req.app.locals.db;
  const user = req.user;
  const restaurantId = req.params.restaurantId;

  if (!ObjectId.isValid(restaurantId)) {
    return res.status(400).json({ error: "ID ristorante non valido" });
  }

  try {
    const restaurant = await db.collection("restaurants").findOne({ _id: new ObjectId(restaurantId), ristoratore_id: new ObjectId(user._id) });
    
    if (!restaurant) {
      return res.status(403).json({ error: "Non puoi eliminare un ristorante che non ti appartiene" });
    }

    await db.collection("meals").deleteMany({ ristorante_id: new ObjectId(restaurantId) });

    await db.collection("orders").deleteMany({ ristorante_id: new ObjectId(restaurantId) });

    await db.collection("restaurants").deleteOne({ _id: new ObjectId(restaurantId) });

    res.json({ message: "Ristorante, piatti e ordini eliminati correttamente." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella cancellazione del ristorante" });
  }
});


export default router;
