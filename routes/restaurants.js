/**
 * Analisi file: restaurants.js.
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
// Esegue: import { validateAddressWithOpenStreetMap } from "../utils/addressValidation.js";
import { validateAddressWithOpenStreetMap } from "../utils/addressValidation.js";

// Esegue: const router = express.Router();
const router = express.Router();

// Esegue: function parseOrderDateToDate(rawValue) {
function parseOrderDateToDate(rawValue) {
  // Esegue: if (!rawValue) return null;
  if (!rawValue) return null;

  // Esegue: const normalized = String(rawValue).trim();
  const normalized = String(rawValue).trim();
  // Esegue: const italianPattern = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s*-\s*(\d{2}):(\d{2}))?$/);
  const italianPattern = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s*-\s*(\d{2}):(\d{2}))?$/);

  // Esegue: if (italianPattern) {
  if (italianPattern) {
    // Esegue: const day = Number(italianPattern[1]);
    const day = Number(italianPattern[1]);
    // Esegue: const month = Number(italianPattern[2]) - 1;
    const month = Number(italianPattern[2]) - 1;
    // Esegue: const year = Number(italianPattern[3]);
    const year = Number(italianPattern[3]);
    // Esegue: const hour = Number(italianPattern[4] || 0);
    const hour = Number(italianPattern[4] || 0);
    // Esegue: const minute = Number(italianPattern[5] || 0);
    const minute = Number(italianPattern[5] || 0);
    // Esegue: return new Date(year, month, day, hour, minute);
    return new Date(year, month, day, hour, minute);
  // Esegue: }
  }

  // Esegue: const genericDate = new Date(normalized);
  const genericDate = new Date(normalized);
  // Esegue: return Number.isNaN(genericDate.getTime()) ? null : genericDate;
  return Number.isNaN(genericDate.getTime()) ? null : genericDate;
// Esegue: }
}

// Esegue: function getYyyyMmDd(dateValue) {
function getYyyyMmDd(dateValue) {
  // Esegue: return dateValue.toISOString().slice(0, 10);
  return dateValue.toISOString().slice(0, 10);
// Esegue: }
}

/**
 * GET /restaurants/search
 * Ricerca ristoranti per nome e indirizzo (parziale, case insensitive)
 * Query params:
 *  - q: stringa da cercare nel nome
 *  - address: stringa da cercare nell'indirizzo
 */
// Esegue: router.get("/search", async (req, res) => {
router.get("/search", async (req, res) => {
  // Esegue: const db = req.app.locals.db;
  const db = req.app.locals.db;
  // Esegue: const { q, address } = req.query;
  const { q, address } = req.query;

  // Esegue: const filter = {};
  const filter = {};

  // Esegue: if (q) {
  if (q) {
    // Esegue: filter.name = { $regex: q, $options: "i" };
    filter.name = { $regex: q, $options: "i" };
  // Esegue: }
  }

  // Esegue: if (address) {
  if (address) {
    // Esegue: filter.address = { $regex: address, $options: "i" };
    filter.address = { $regex: address, $options: "i" };
  // Esegue: }
  }

  // Esegue: try {
  try {
    // Esegue: const restaurants = await db.collection("restaurants")
    const restaurants = await db.collection("restaurants")
      // Esegue: .find(filter)
      .find(filter)
      // Esegue: .toArray();
      .toArray();

    // Esegue: res.json({ total: restaurants.length, restaurants });
    res.json({ total: restaurants.length, restaurants });
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nella ricerca ristoranti" });
    res.status(500).json({ error: "Errore nella ricerca ristoranti" });
  // Esegue: }
  }
// Esegue: });
});



/**
 * GET /restaurants/by-meal
 * Ricerca ristoranti che hanno nel menu un piatto che matcha il nome richiesto
 * Query params:
 *  - meal: stringa da cercare nel nome del piatto
 */
// Esegue: router.get("/by-meal", async (req, res) => {
router.get("/by-meal", async (req, res) => {
  // Esegue: const db = req.app.locals.db;
  const db = req.app.locals.db;
  // Esegue: const { meal } = req.query;
  const { meal } = req.query;

  // Esegue: if (!meal) {
  if (!meal) {
    // Esegue: return res.status(400).json({ error: "Parametro 'meal' obbligatorio" });
    return res.status(400).json({ error: "Parametro 'meal' obbligatorio" });
  // Esegue: }
  }

  // Esegue: try {
  try {
    // Esegue: const meals = await db.collection("meals").find({
    const meals = await db.collection("meals").find({
      // Esegue: strMeal: { $regex: meal, $options: "i" }
      strMeal: { $regex: meal, $options: "i" }
    // Esegue: }, { projection: { _id: 1, strMeal: 1, ristorante_id: 1 } }).toArray();
    }, { projection: { _id: 1, strMeal: 1, ristorante_id: 1 } }).toArray();

    // Esegue: if (meals.length === 0) {
    if (meals.length === 0) {
      // Esegue: return res.json({ total: 0, restaurants: [] });
      return res.json({ total: 0, restaurants: [] });
    // Esegue: }
    }

    // Esegue: const restaurantIds = [...new Set(meals
    const restaurantIds = [...new Set(meals
      // Esegue: .map((m) => m.ristorante_id)
      .map((m) => m.ristorante_id)
      // Esegue: .filter(Boolean)
      .filter(Boolean)
      // Esegue: .map((id) => id.toString()))]
      .map((id) => id.toString()))]
      // Esegue: .map((id) => new ObjectId(id));
      .map((id) => new ObjectId(id));

    // Esegue: const restaurants = await db.collection("restaurants").find({ _id: { $in: restaurantIds } }).toAr...
    const restaurants = await db.collection("restaurants").find({ _id: { $in: restaurantIds } }).toArray();

    // Esegue: const mealsByRestaurant = meals.reduce((acc, m) => {
    const mealsByRestaurant = meals.reduce((acc, m) => {
      // Esegue: if (!m.ristorante_id) return acc;
      if (!m.ristorante_id) return acc;
      // Esegue: const key = m.ristorante_id.toString();
      const key = m.ristorante_id.toString();
      // Esegue: acc[key] = acc[key] || [];
      acc[key] = acc[key] || [];
      // Esegue: acc[key].push({ _id: m._id, strMeal: m.strMeal });
      acc[key].push({ _id: m._id, strMeal: m.strMeal });
      // Esegue: return acc;
      return acc;
    // Esegue: }, {});
    }, {});

    // Esegue: const enrichedRestaurants = restaurants.map((r) => ({
    const enrichedRestaurants = restaurants.map((r) => ({
      // Esegue: ...r,
      ...r,
      // Esegue: matchingMeals: mealsByRestaurant[r._id.toString()] || []
      matchingMeals: mealsByRestaurant[r._id.toString()] || []
    // Esegue: }));
    }));

    // Esegue: res.json({ total: enrichedRestaurants.length, restaurants: enrichedRestaurants });
    res.json({ total: enrichedRestaurants.length, restaurants: enrichedRestaurants });
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nella ricerca ristoranti per piatto" });
    res.status(500).json({ error: "Errore nella ricerca ristoranti per piatto" });
  // Esegue: }
  }
// Esegue: });
});

//GET /restaurants - Lista ristoranti registrati
// Esegue: router.get("/", async (req, res) => {
router.get("/", async (req, res) => {
  // Esegue: const db = req.app.locals.db;
  const db = req.app.locals.db;
  // Esegue: try {
  try {
    // Esegue: const restaurants = await db.collection("restaurants").find({}).toArray();
    const restaurants = await db.collection("restaurants").find({}).toArray();
    // Esegue: res.json(restaurants);
    res.json(restaurants);
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nel recupero dei ristoranti" });
    res.status(500).json({ error: "Errore nel recupero dei ristoranti" });
  // Esegue: }
  }
// Esegue: });
});


// GET /restaurants/statistics - Statistiche ristorante (Richiede autenticazione ristoratore)
// Esegue: router.get("/statistics", authenticateUser, authorizeRistoratore, async (req, res) => {
router.get("/statistics", authenticateUser, authorizeRistoratore, async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const user = req.user;
    const user = req.user;

    // Esegue: const ristorante = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user...
    const ristorante = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user._id) });

    // Esegue: if (!ristorante) {
    if (!ristorante) {
      // Esegue: return res.status(404).json({ error: "Ristorante non trovato" });
      return res.status(404).json({ error: "Ristorante non trovato" });
    // Esegue: }
    }

    // Esegue: const orders = await db.collection("orders").find({ ristorante_id: new ObjectId(ristorante._id) }...
    const orders = await db.collection("orders").find({ ristorante_id: new ObjectId(ristorante._id) }).toArray();
    // Esegue: const deliveredOrders = orders.filter((order) => order.stato === "consegnato");
    const deliveredOrders = orders.filter((order) => order.stato === "consegnato");

    // Esegue: const totalOrders = orders.length;
    const totalOrders = orders.length;
    // Esegue: const totalDeliveredOrders = deliveredOrders.length;
    const totalDeliveredOrders = deliveredOrders.length;
    // Esegue: let totalRevenue = 0;
    let totalRevenue = 0;
    // Esegue: let deliveredRevenue = 0;
    let deliveredRevenue = 0;
    // Esegue: let ordersByState = {};
    let ordersByState = {};
    // Esegue: let mealCount = {};
    let mealCount = {};
    // Esegue: let ordersTrend = {};
    let ordersTrend = {};
    // Esegue: const statusOrder = ["ordinato", "in preparazione", "in consegna", "consegnato"];
    const statusOrder = ["ordinato", "in preparazione", "in consegna", "consegnato"];

    // Esegue: orders.forEach(({ totale, stato, meals, data_ordine }) => {
    orders.forEach(({ totale, stato, meals, data_ordine }) => {
      // Esegue: const orderTotal = Number(totale) || 0;
      const orderTotal = Number(totale) || 0;
      // Esegue: totalRevenue += orderTotal;
      totalRevenue += orderTotal;
      // Esegue: ordersByState[stato] = (ordersByState[stato] || 0) + 1;
      ordersByState[stato] = (ordersByState[stato] || 0) + 1;
      // Esegue: if (stato === "consegnato") {
      if (stato === "consegnato") {
        // Esegue: deliveredRevenue += orderTotal;
        deliveredRevenue += orderTotal;
      // Esegue: }
      }

      // Esegue: if (Array.isArray(meals)) {
      if (Array.isArray(meals)) {
        // Esegue: meals.forEach(({ nome, quantita }) => {
        meals.forEach(({ nome, quantita }) => {
          // Esegue: if (!nome) return;
          if (!nome) return;
          // Esegue: mealCount[nome] = (mealCount[nome] || 0) + (Number(quantita) || 0);
          mealCount[nome] = (mealCount[nome] || 0) + (Number(quantita) || 0);
        // Esegue: });
        });
      // Esegue: }
      }

      // Esegue: const parsedDate = parseOrderDateToDate(data_ordine);
      const parsedDate = parseOrderDateToDate(data_ordine);
      // Esegue: if (!parsedDate) return;
      if (!parsedDate) return;
      // Esegue: const dateKey = getYyyyMmDd(parsedDate);
      const dateKey = getYyyyMmDd(parsedDate);
      // Esegue: ordersTrend[dateKey] = (ordersTrend[dateKey] || 0) + 1;
      ordersTrend[dateKey] = (ordersTrend[dateKey] || 0) + 1;
    // Esegue: });
    });

    // Esegue: statusOrder.forEach((status) => {
    statusOrder.forEach((status) => {
      // Esegue: ordersByState[status] = ordersByState[status] || 0;
      ordersByState[status] = ordersByState[status] || 0;
    // Esegue: });
    });

    // Esegue: const ordersTrendLast30Days = Object.entries(ordersTrend)
    const ordersTrendLast30Days = Object.entries(ordersTrend)
      // Esegue: .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      // Esegue: .slice(-30)
      .slice(-30)
      // Esegue: .reduce((acc, [date, count]) => {
      .reduce((acc, [date, count]) => {
        // Esegue: acc[date] = count;
        acc[date] = count;
        // Esegue: return acc;
        return acc;
      // Esegue: }, {});
      }, {});

    // Esegue: res.json({
    res.json({
      // Esegue: totalOrders,
      totalOrders,
      // Esegue: totalDeliveredOrders,
      totalDeliveredOrders,
      // Esegue: totalRevenue,
      totalRevenue,
      // Esegue: deliveredRevenue,
      deliveredRevenue,
      // Esegue: ordersByState,
      ordersByState,
      // Esegue: topMeals: Object.entries(mealCount).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topMeals: Object.entries(mealCount).sort((a, b) => b[1] - a[1]).slice(0, 5),
      // Esegue: ordersTrend: ordersTrendLast30Days
      ordersTrend: ordersTrendLast30Days
    // Esegue: });
    });

  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: res.status(500).json({ error: "Errore nel recupero delle statistiche" });
    res.status(500).json({ error: "Errore nel recupero delle statistiche" });
  // Esegue: }
  }
// Esegue: });
});

//GET /restaurants/:restaurantID - Informazioni di uno specifico ristorante, menu incluso
// Esegue: router.get("/:restaurantId", async (req, res) => {
router.get("/:restaurantId", async (req, res) => {
  // Esegue: const db = req.app.locals.db;
  const db = req.app.locals.db;
  // Esegue: const restaurantId = req.params.restaurantId;
  const restaurantId = req.params.restaurantId;

  // Esegue: if (!ObjectId.isValid(restaurantId)) {
  if (!ObjectId.isValid(restaurantId)) {
    // Esegue: return res.status(400).json({ error: "ID ristorante non valido" });
    return res.status(400).json({ error: "ID ristorante non valido" });
  // Esegue: }
  }

  // Esegue: try {
  try {
    // Esegue: const restaurant = await db.collection("restaurants").findOne({ _id: new ObjectId(restaurantId) });
    const restaurant = await db.collection("restaurants").findOne({ _id: new ObjectId(restaurantId) });
    // Esegue: if (!restaurant) {
    if (!restaurant) {
      // Esegue: return res.status(404).json({ error: "Ristorante non trovato" });
      return res.status(404).json({ error: "Ristorante non trovato" });
    // Esegue: }
    }
    // Esegue: const mealIds = Array.isArray(restaurant.menu)
    const mealIds = Array.isArray(restaurant.menu) 
    // Esegue: ? restaurant.menu.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id))
    ? restaurant.menu.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id))
    // Esegue: : [];
    : [];
    // Esegue: const meals = await db.collection("meals").find({ _id: { $in: mealIds } }).toArray();
    const meals = await db.collection("meals").find({ _id: { $in: mealIds } }).toArray();

    // Esegue: res.json({ ...restaurant, meals: meals });
    res.json({ ...restaurant, meals: meals });

  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nel recupero del ristorante" });
    res.status(500).json({ error: "Errore nel recupero del ristorante" });
  // Esegue: }
  }
// Esegue: });
});


// POST /restaurants - Crea un nuovo ristorante (Richiede autenticazione ristoratore)
// Esegue: router.post("/", authenticateUser, authorizeRistoratore, async (req, res) => {
router.post("/", authenticateUser, authorizeRistoratore, async (req, res) => {
  // Esegue: const db = req.app.locals.db;
  const db = req.app.locals.db;
  // Esegue: const user = req.user;
  const user = req.user;
  // Esegue: const { name, address, numero_di_telefono, piva, menu, description, image } = req.body;
  const { name, address, numero_di_telefono, piva, menu, description, image } = req.body;
  // Esegue: if (!name || !address || !numero_di_telefono) {
  if (!name || !address || !numero_di_telefono) {
    // Esegue: return res.status(400).json({ error: "Nome, indirizzo e numero di telefono sono obbligatori" });
    return res.status(400).json({ error: "Nome, indirizzo e numero di telefono sono obbligatori" });
  // Esegue: }
  }

  // Esegue: const addressValidation = await validateAddressWithOpenStreetMap(address);
  const addressValidation = await validateAddressWithOpenStreetMap(address);
  // Esegue: if (!addressValidation.valid) {
  if (!addressValidation.valid) {
    // Esegue: return res.status(400).json({
    return res.status(400).json({
      // Esegue: error: `Indirizzo ristorante non valido. ${addressValidation.reason}`
      error: `Indirizzo ristorante non valido. ${addressValidation.reason}`
    // Esegue: });
    });
  // Esegue: }
  }

  // Esegue: try {
  try {
    // Esegue: const existingRestaurant = await db.collection("restaurants").findOne({ ristoratore_id: new Objec...
    const existingRestaurant = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user._id) });
    // Esegue: if (existingRestaurant) {
    if (existingRestaurant) {
      // Esegue: return res.status(400).json({ error: "Hai già un ristorante associato" });
      return res.status(400).json({ error: "Hai già un ristorante associato" });
    // Esegue: }
    }

    // Esegue: const ristoratore = await db.collection("users").findOne({ _id: new ObjectId(user._id) });
    const ristoratore = await db.collection("users").findOne({ _id: new ObjectId(user._id) });
    // Esegue: const partitaIva = piva || ristoratore?.piva;
    const partitaIva = piva || ristoratore?.piva;
    // Esegue: if (!partitaIva) {
    if (!partitaIva) {
      // Esegue: return res.status(400).json({ error: "Partita IVA obbligatoria per creare un ristorante" });
      return res.status(400).json({ error: "Partita IVA obbligatoria per creare un ristorante" });
    // Esegue: }
    }

    // Esegue: const newRestaurant = {
    const newRestaurant = {
      // Esegue: name,
      name,
      // Esegue: address,
      address,
      // Esegue: numero_di_telefono,
      numero_di_telefono,
      // Esegue: piva: partitaIva,
      piva: partitaIva,
      // Esegue: description,
      description,
      // Esegue: image,
      image,
      // Esegue: menu,
      menu,
      // Esegue: ristoratore_id: new ObjectId(user._id)
      ristoratore_id: new ObjectId(user._id)
    // Esegue: };
    };

    // Esegue: const result = await db.collection("restaurants").insertOne(newRestaurant);
    const result = await db.collection("restaurants").insertOne(newRestaurant);
    // Esegue: res.status(201).json({ ...newRestaurant, _id: result.insertedId });
    res.status(201).json({ ...newRestaurant, _id: result.insertedId });
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nella creazione del ristorante" });
    res.status(500).json({ error: "Errore nella creazione del ristorante" });
  // Esegue: }
  }
// Esegue: });
});

//PUT /restaurants/:restaurantId - Modifica dati ristorante (Richiede autenticazione ristoratore)
// Esegue: router.put("/:restaurantId", authenticateUser, authorizeRistoratore, async (req, res) => {
router.put("/:restaurantId", authenticateUser, authorizeRistoratore, async (req, res) => {
  // Esegue: const db = req.app.locals.db;
  const db = req.app.locals.db;
  // Esegue: const user = req.user;
  const user = req.user;
  // Esegue: const restaurantId = req.params.restaurantId;
  const restaurantId = req.params.restaurantId;
  // Esegue: const { name, address, numero_di_telefono, piva, menu, description, image } = req.body;
  const { name, address, numero_di_telefono, piva, menu, description, image } = req.body;
  // Esegue: if (!ObjectId.isValid(restaurantId)) {
  if (!ObjectId.isValid(restaurantId)) {
    // Esegue: return res.status(400).json({ error: "ID ristorante non valido" });
    return res.status(400).json({ error: "ID ristorante non valido" });
  // Esegue: }
  }

  // Esegue: try {
  try {
    // Esegue: const restaurant = await db.collection("restaurants").findOne({ _id: new ObjectId(restaurantId) });
    const restaurant = await db.collection("restaurants").findOne({ _id: new ObjectId(restaurantId) });
    // Esegue: if (!restaurant) {
    if (!restaurant) {
      // Esegue: return res.status(404).json({ error: "Ristorante non trovato" });
      return res.status(404).json({ error: "Ristorante non trovato" });
    // Esegue: }
    }

    // Esegue: if (restaurant.ristoratore_id.toString() !== user._id.toString()) {
    if (restaurant.ristoratore_id.toString() !== user._id.toString()) {
      // Esegue: return res.status(403).json({ error: "Accesso negato: non proprietario del ristorante" });
      return res.status(403).json({ error: "Accesso negato: non proprietario del ristorante" });
    // Esegue: }
    }

    // Esegue: const updateDoc={};
    const updateDoc={};

    // Esegue: if (name) updateDoc.name = name;
    if (name) updateDoc.name = name;
    // Esegue: if (address) updateDoc.address = address;
    if (address) updateDoc.address = address;
    // Esegue: if (numero_di_telefono) updateDoc.numero_di_telefono = numero_di_telefono;
    if (numero_di_telefono) updateDoc.numero_di_telefono = numero_di_telefono;
    // Esegue: if (piva) updateDoc.piva = piva;
    if (piva) updateDoc.piva = piva;
    // Esegue: if (menu) updateDoc.menu = menu;
    if (menu) updateDoc.menu = menu;
    // Esegue: if (description) updateDoc.description = description;
    if (description) updateDoc.description = description;
    // Esegue: if (image) updateDoc.image = image;
    if (image) updateDoc.image = image;

    // Esegue: await db.collection("restaurants").updateOne(
    await db.collection("restaurants").updateOne(
      // Esegue: { _id: new ObjectId(restaurantId) },
      { _id: new ObjectId(restaurantId) },
      // Esegue: { $set: updateDoc }
      { $set: updateDoc }
    // Esegue: );
    );

    // Esegue: const updatedRestaurant = await db.collection("restaurants").findOne({ _id: new ObjectId(restaura...
    const updatedRestaurant = await db.collection("restaurants").findOne({ _id: new ObjectId(restaurantId) });
    // Esegue: res.json(updatedRestaurant);
    res.json(updatedRestaurant);
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nella modifica del ristorante" });
    res.status(500).json({ error: "Errore nella modifica del ristorante" });
  // Esegue: }
  }
// Esegue: });
});

//DELETE /restaurants/:restaurantId - Elimina ristorante, tutti gli ordini e tutti i piatti personalizzati associati (Richiede autenticazione ristoratore)
// Esegue: router.delete("/:restaurantId", authenticateUser, authorizeRistoratore, async (req, res) => {
router.delete("/:restaurantId", authenticateUser, authorizeRistoratore, async (req, res) => {
  // Esegue: const db = req.app.locals.db;
  const db = req.app.locals.db;
  // Esegue: const user = req.user;
  const user = req.user;
  // Esegue: const restaurantId = req.params.restaurantId;
  const restaurantId = req.params.restaurantId;

  // Esegue: if (!ObjectId.isValid(restaurantId)) {
  if (!ObjectId.isValid(restaurantId)) {
    // Esegue: return res.status(400).json({ error: "ID ristorante non valido" });
    return res.status(400).json({ error: "ID ristorante non valido" });
  // Esegue: }
  }

  // Esegue: try {
  try {
    // Esegue: const restaurant = await db.collection("restaurants").findOne({ _id: new ObjectId(restaurantId), ...
    const restaurant = await db.collection("restaurants").findOne({ _id: new ObjectId(restaurantId), ristoratore_id: new ObjectId(user._id) });
    
    // Esegue: if (!restaurant) {
    if (!restaurant) {
      // Esegue: return res.status(403).json({ error: "Non puoi eliminare un ristorante che non ti appartiene" });
      return res.status(403).json({ error: "Non puoi eliminare un ristorante che non ti appartiene" });
    // Esegue: }
    }

    // Esegue: await db.collection("meals").deleteMany({ ristorante_id: new ObjectId(restaurantId) });
    await db.collection("meals").deleteMany({ ristorante_id: new ObjectId(restaurantId) });

    // Esegue: await db.collection("orders").deleteMany({ ristorante_id: new ObjectId(restaurantId) });
    await db.collection("orders").deleteMany({ ristorante_id: new ObjectId(restaurantId) });

    // Esegue: await db.collection("restaurants").deleteOne({ _id: new ObjectId(restaurantId) });
    await db.collection("restaurants").deleteOne({ _id: new ObjectId(restaurantId) });

    // Esegue: res.json({ message: "Ristorante, piatti e ordini eliminati correttamente." });
    res.json({ message: "Ristorante, piatti e ordini eliminati correttamente." });

  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nella cancellazione del ristorante" });
    res.status(500).json({ error: "Errore nella cancellazione del ristorante" });
  // Esegue: }
  }
// Esegue: });
});


// Esegue: export default router;
export default router;
