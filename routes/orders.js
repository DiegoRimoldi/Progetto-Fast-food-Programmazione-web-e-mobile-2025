/**
 * Analisi file: orders.js.
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
// Esegue: import { DateTime } from "luxon";
import { DateTime } from "luxon";

// Esegue: const ordersRouter = express.Router();
const ordersRouter = express.Router();
// Esegue: const validStates = ["ordinato", "in preparazione", "in consegna", "consegnato"];
const validStates = ["ordinato", "in preparazione", "in consegna", "consegnato"];
// Esegue: const DELIVERY_COST_PER_KM = 0.7;
const DELIVERY_COST_PER_KM = 0.7;
// Esegue: const DELIVERY_BASE_COST = 1.5;
const DELIVERY_BASE_COST = 1.5;
// Esegue: const OSRM_TIMEOUT_MS = 7000;
const OSRM_TIMEOUT_MS = 7000;

// Esegue: async function geocodeAddress(address) {
async function geocodeAddress(address) {
  // Esegue: const url = new URL("https://nominatim.openstreetmap.org/search");
  const url = new URL("https://nominatim.openstreetmap.org/search");
  // Esegue: url.searchParams.set("q", address);
  url.searchParams.set("q", address);
  // Esegue: url.searchParams.set("format", "json");
  url.searchParams.set("format", "json");
  // Esegue: url.searchParams.set("limit", "1");
  url.searchParams.set("limit", "1");

  // Esegue: const response = await fetch(url, {
  const response = await fetch(url, {
    // Esegue: headers: {
    headers: {
      // Esegue: "User-Agent": "FastFoodProject/1.0 (A.A.2025-2026)"
      "User-Agent": "FastFoodProject/1.0 (A.A.2025-2026)"
    // Esegue: }
    }
  // Esegue: });
  });

  // Esegue: if (!response.ok) {
  if (!response.ok) {
    // Esegue: throw new Error(`Errore geocoding OpenStreetMap: ${response.status}`);
    throw new Error(`Errore geocoding OpenStreetMap: ${response.status}`);
  // Esegue: }
  }

  // Esegue: const data = await response.json();
  const data = await response.json();
  // Esegue: if (!Array.isArray(data) || data.length === 0) {
  if (!Array.isArray(data) || data.length === 0) {
    // Esegue: throw new Error(`Indirizzo non trovato: ${address}`);
    throw new Error(`Indirizzo non trovato: ${address}`);
  // Esegue: }
  }

  // Esegue: return {
  return {
    // Esegue: lat: parseFloat(data[0].lat),
    lat: parseFloat(data[0].lat),
    // Esegue: lon: parseFloat(data[0].lon)
    lon: parseFloat(data[0].lon)
  // Esegue: };
  };
// Esegue: }
}

// Esegue: function haversineKm(coord1, coord2) {
function haversineKm(coord1, coord2) {
  // Esegue: const toRad = (deg) => (deg * Math.PI) / 180;
  const toRad = (deg) => (deg * Math.PI) / 180;
  // Esegue: const earthRadiusKm = 6371;
  const earthRadiusKm = 6371;

  // Esegue: const dLat = toRad(coord2.lat - coord1.lat);
  const dLat = toRad(coord2.lat - coord1.lat);
  // Esegue: const dLon = toRad(coord2.lon - coord1.lon);
  const dLon = toRad(coord2.lon - coord1.lon);
  // Esegue: const a =
  const a =
    // Esegue: Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    // Esegue: Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    // Esegue: Math.sin(dLon / 2) * Math.sin(dLon / 2);
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  // Esegue: return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
// Esegue: }
}

// Esegue: async function getDrivingRouteMetrics(coordFrom, coordTo) {
async function getDrivingRouteMetrics(coordFrom, coordTo) {
  // Esegue: const routeUrl = new URL(
  const routeUrl = new URL(
    // Esegue: `https://router.project-osrm.org/route/v1/driving/${coordFrom.lon},${coordFrom.lat};${coordTo.lon...
    `https://router.project-osrm.org/route/v1/driving/${coordFrom.lon},${coordFrom.lat};${coordTo.lon},${coordTo.lat}`
  // Esegue: );
  );
  // Esegue: routeUrl.searchParams.set("overview", "false");
  routeUrl.searchParams.set("overview", "false");
  // Esegue: routeUrl.searchParams.set("alternatives", "false");
  routeUrl.searchParams.set("alternatives", "false");
  // Esegue: routeUrl.searchParams.set("steps", "false");
  routeUrl.searchParams.set("steps", "false");

  // Esegue: const controller = new AbortController();
  const controller = new AbortController();
  // Esegue: const timeout = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);
  const timeout = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);

  // Esegue: try {
  try {
    // Esegue: const response = await fetch(routeUrl, {
    const response = await fetch(routeUrl, {
      // Esegue: headers: {
      headers: {
        // Esegue: "User-Agent": "FastFoodProject/1.0 (A.A.2025-2026)"
        "User-Agent": "FastFoodProject/1.0 (A.A.2025-2026)"
      // Esegue: },
      },
      // Esegue: signal: controller.signal
      signal: controller.signal
    // Esegue: });
    });

    // Esegue: if (!response.ok) {
    if (!response.ok) {
      // Esegue: throw new Error(`Errore routing OpenStreetMap/OSRM: ${response.status}`);
      throw new Error(`Errore routing OpenStreetMap/OSRM: ${response.status}`);
    // Esegue: }
    }

    // Esegue: const data = await response.json();
    const data = await response.json();
    // Esegue: const firstRoute = data?.routes?.[0];
    const firstRoute = data?.routes?.[0];

    // Esegue: if (!firstRoute || typeof firstRoute.distance !== "number" || typeof firstRoute.duration !== "num...
    if (!firstRoute || typeof firstRoute.distance !== "number" || typeof firstRoute.duration !== "number") {
      // Esegue: throw new Error("Risposta routing OSRM non valida");
      throw new Error("Risposta routing OSRM non valida");
    // Esegue: }
    }

    // Esegue: return {
    return {
      // Esegue: distanzaKm: Number((firstRoute.distance / 1000).toFixed(2)),
      distanzaKm: Number((firstRoute.distance / 1000).toFixed(2)),
      // Esegue: durataMin: Math.max(1, Math.ceil(firstRoute.duration / 60))
      durataMin: Math.max(1, Math.ceil(firstRoute.duration / 60))
    // Esegue: };
    };
  // Esegue: } finally {
  } finally {
    // Esegue: clearTimeout(timeout);
    clearTimeout(timeout);
  // Esegue: }
  }
// Esegue: }
}

// Esegue: function calculateOrderPreparationMinutes(order) {
function calculateOrderPreparationMinutes(order) {
  // Esegue: if (!Array.isArray(order?.meals)) return 0;
  if (!Array.isArray(order?.meals)) return 0;

  // Esegue: return order.meals.reduce((totale, meal) => {
  return order.meals.reduce((totale, meal) => {
    // Esegue: const quantita = Number.isFinite(meal?.quantita) ? meal.quantita : 0;
    const quantita = Number.isFinite(meal?.quantita) ? meal.quantita : 0;
    // Esegue: const tempoPreparazione = Number.isFinite(meal?.tempo_preparazione) ? meal.tempo_preparazione : 10;
    const tempoPreparazione = Number.isFinite(meal?.tempo_preparazione) ? meal.tempo_preparazione : 10;
    // Esegue: return totale + (quantita * tempoPreparazione);
    return totale + (quantita * tempoPreparazione);
  // Esegue: }, 0);
  }, 0);
// Esegue: }
}

// POST /orders - Crea nuovo ordine per l'utente autenticato
// Esegue: ordersRouter.post("/", authenticateUser, async (req, res) => {
ordersRouter.post("/", authenticateUser, async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const user = req.user;
    const user = req.user;

    // Esegue: if (user.role !== "cliente") {
    if (user.role !== "cliente") {
      // Esegue: return res.status(403).json({ error: "Solo i clienti possono creare ordini" });
      return res.status(403).json({ error: "Solo i clienti possono creare ordini" });
    // Esegue: }
    }

    // Esegue: const { meals, metodo_consegna, indirizzo_consegna } = req.body;
    const { meals, metodo_consegna, indirizzo_consegna } = req.body;

    // Esegue: if (!Array.isArray(meals) || meals.length === 0) {
    if (!Array.isArray(meals) || meals.length === 0) {
      // Esegue: return res.status(400).json({ error: "meals deve essere un array non vuoto" });
      return res.status(400).json({ error: "meals deve essere un array non vuoto" });
    // Esegue: }
    }

    // Esegue: if (!["Ritiro in ristorante", "Consegna a domicilio"].includes(metodo_consegna)) {
    if (!["Ritiro in ristorante", "Consegna a domicilio"].includes(metodo_consegna)) {
      // Esegue: return res.status(400).json({ error: "metodo_consegna non valido" });
      return res.status(400).json({ error: "metodo_consegna non valido" });
    // Esegue: }
    }

    // Esegue: const ordiniPerRistoranti = {};
    const ordiniPerRistoranti = {};

    // Esegue: for (const m of meals) {
    for (const m of meals) {
      // Esegue: if (!m.ristorante_id || !ObjectId.isValid(m.ristorante_id)) {
      if (!m.ristorante_id || !ObjectId.isValid(m.ristorante_id)) {
        // Esegue: return res.status(400).json({ error: `ristorante_id mancante o non valido per il piatto: ${m.nome...
        return res.status(400).json({ error: `ristorante_id mancante o non valido per il piatto: ${m.nome}` });
      // Esegue: }
      }

      // Esegue: const ristoranteId = new ObjectId(m.ristorante_id).toString();
      const ristoranteId = new ObjectId(m.ristorante_id).toString();
      // Esegue: ordiniPerRistoranti[ristoranteId] = ordiniPerRistoranti[ristoranteId] || [];
      ordiniPerRistoranti[ristoranteId] = ordiniPerRistoranti[ristoranteId] || [];
      // Esegue: ordiniPerRistoranti[ristoranteId].push({
      ordiniPerRistoranti[ristoranteId].push({
        // Esegue: _id: new ObjectId(m._id),
        _id: new ObjectId(m._id),
        // Esegue: nome: m.nome,
        nome: m.nome,
        // Esegue: quantita: m.quantita,
        quantita: m.quantita,
        // Esegue: prezzo_unitario: m.prezzo_unitario,
        prezzo_unitario: m.prezzo_unitario,
        // Esegue: tempo_preparazione: m.tempo_preparazione || 10
        tempo_preparazione: m.tempo_preparazione || 10
      // Esegue: });
      });
    // Esegue: }
    }

    // Esegue: const utente = await db.collection("users").findOne({ _id: new ObjectId(user._id) });
    const utente = await db.collection("users").findOne({ _id: new ObjectId(user._id) });
    // Esegue: if (!utente) {
    if (!utente) {
      // Esegue: return res.status(404).json({ error: "Utente non trovato" });
      return res.status(404).json({ error: "Utente non trovato" });
    // Esegue: }
    }

    // Esegue: if (metodo_consegna === "Consegna a domicilio" && !(indirizzo_consegna || utente.indirizzo)) {
    if (metodo_consegna === "Consegna a domicilio" && !(indirizzo_consegna || utente.indirizzo)) {
      // Esegue: return res.status(400).json({ error: "Indirizzo di consegna mancante" });
      return res.status(400).json({ error: "Indirizzo di consegna mancante" });
    // Esegue: }
    }

    // Esegue: const results = await Promise.all(Object.keys(ordiniPerRistoranti).map(async (ristoranteId) => {
    const results = await Promise.all(Object.keys(ordiniPerRistoranti).map(async (ristoranteId) => {
      // Esegue: let totale = 0;
      let totale = 0;
      // Esegue: let tempoAttesa = 0;
      let tempoAttesa = 0;
      // Esegue: let costoConsegna = 0;
      let costoConsegna = 0;
      // Esegue: let distanzaKm = 0;
      let distanzaKm = 0;
      // Esegue: let durataConsegnaMin = 0;
      let durataConsegnaMin = 0;

      // Esegue: ordiniPerRistoranti[ristoranteId].forEach((meal) => {
      ordiniPerRistoranti[ristoranteId].forEach((meal) => {
        // Esegue: totale += meal.quantita * meal.prezzo_unitario;
        totale += meal.quantita * meal.prezzo_unitario;
        // Esegue: tempoAttesa += meal.quantita * meal.tempo_preparazione;
        tempoAttesa += meal.quantita * meal.tempo_preparazione;
      // Esegue: });
      });

      // Esegue: const ordiniRistorante = await db.collection("orders").find({
      const ordiniRistorante = await db.collection("orders").find({
        // Esegue: ristorante_id: new ObjectId(ristoranteId),
        ristorante_id: new ObjectId(ristoranteId),
        // Esegue: stato: { $ne: "consegnato" }
        stato: { $ne: "consegnato" }
      // Esegue: }).toArray();
      }).toArray();

      // Esegue: const ristorante = await db.collection("restaurants").findOne({ _id: new ObjectId(ristoranteId) });
      const ristorante = await db.collection("restaurants").findOne({ _id: new ObjectId(ristoranteId) });
      // Esegue: if (!ristorante) {
      if (!ristorante) {
        // Esegue: throw new Error(`Ristorante non trovato per id ${ristoranteId}`);
        throw new Error(`Ristorante non trovato per id ${ristoranteId}`);
      // Esegue: }
      }

      // ordine va direttamente in preparazione se è il primo della coda del ristorante
      // Esegue: const stato = ordiniRistorante.length === 0 ? "in preparazione" : "ordinato";
      const stato = ordiniRistorante.length === 0 ? "in preparazione" : "ordinato";

      // Esegue: ordiniRistorante.forEach((o) => {
      ordiniRistorante.forEach((o) => {
        // Esegue: if (["in preparazione", "ordinato"].includes(o.stato)) {
        if (["in preparazione", "ordinato"].includes(o.stato)) {
          // Esegue: tempoAttesa += calculateOrderPreparationMinutes(o);
          tempoAttesa += calculateOrderPreparationMinutes(o);
        // Esegue: }
        }
      // Esegue: });
      });

      // Esegue: const indirizzoEffettivo = indirizzo_consegna || utente.indirizzo;
      const indirizzoEffettivo = indirizzo_consegna || utente.indirizzo;
      // Esegue: if (metodo_consegna === "Consegna a domicilio") {
      if (metodo_consegna === "Consegna a domicilio") {
        // Esegue: const [coordRistorante, coordConsegna] = await Promise.all([
        const [coordRistorante, coordConsegna] = await Promise.all([
          // Esegue: geocodeAddress(ristorante.address),
          geocodeAddress(ristorante.address),
          // Esegue: geocodeAddress(indirizzoEffettivo)
          geocodeAddress(indirizzoEffettivo)
        // Esegue: ]);
        ]);

        // Esegue: try {
        try {
          // Esegue: const routeMetrics = await getDrivingRouteMetrics(coordRistorante, coordConsegna);
          const routeMetrics = await getDrivingRouteMetrics(coordRistorante, coordConsegna);
          // Esegue: distanzaKm = routeMetrics.distanzaKm;
          distanzaKm = routeMetrics.distanzaKm;
          // Esegue: durataConsegnaMin = routeMetrics.durataMin;
          durataConsegnaMin = routeMetrics.durataMin;
        // Esegue: } catch (routingError) {
        } catch (routingError) {
          // Esegue: console.warn("Routing OSRM non disponibile, fallback su distanza lineare.", routingError.message);
          console.warn("Routing OSRM non disponibile, fallback su distanza lineare.", routingError.message);
          // Esegue: distanzaKm = Number(haversineKm(coordRistorante, coordConsegna).toFixed(2));
          distanzaKm = Number(haversineKm(coordRistorante, coordConsegna).toFixed(2));
          // Fallback prudenziale: velocità media urbana ~35 km/h
          // Esegue: durataConsegnaMin = Math.max(1, Math.ceil((distanzaKm / 35) * 60));
          durataConsegnaMin = Math.max(1, Math.ceil((distanzaKm / 35) * 60));
        // Esegue: }
        }

        // Esegue: tempoAttesa += durataConsegnaMin;
        tempoAttesa += durataConsegnaMin;
        // Esegue: costoConsegna = Number((DELIVERY_BASE_COST + (distanzaKm * DELIVERY_COST_PER_KM)).toFixed(2));
        costoConsegna = Number((DELIVERY_BASE_COST + (distanzaKm * DELIVERY_COST_PER_KM)).toFixed(2));
        // Esegue: totale += costoConsegna;
        totale += costoConsegna;
      // Esegue: }
      }

      // Esegue: const newOrder = {
      const newOrder = {
        // Esegue: cliente_id: new ObjectId(utente._id),
        cliente_id: new ObjectId(utente._id),
        // Esegue: cliente_nome: utente.username,
        cliente_nome: utente.username,
        // Esegue: ristorante_id: new ObjectId(ristoranteId),
        ristorante_id: new ObjectId(ristoranteId),
        // Esegue: meals: ordiniPerRistoranti[ristoranteId],
        meals: ordiniPerRistoranti[ristoranteId],
        // Esegue: totale,
        totale,
        // Esegue: stato,
        stato,
        // Esegue: data_ordine: DateTime.now().setZone("Europe/Rome").toFormat("dd/MM/yyyy - HH:mm"),
        data_ordine: DateTime.now().setZone("Europe/Rome").toFormat("dd/MM/yyyy - HH:mm"),
        // Esegue: metodo_consegna,
        metodo_consegna,
        // Esegue: indirizzo_consegna: metodo_consegna === "Consegna a domicilio" ? indirizzoEffettivo : null,
        indirizzo_consegna: metodo_consegna === "Consegna a domicilio" ? indirizzoEffettivo : null,
        // Esegue: notifica_ristoratore_consegna: false,
        notifica_ristoratore_consegna: false,
        // Esegue: distanza_km: distanzaKm,
        distanza_km: distanzaKm,
        // Esegue: costo_consegna: costoConsegna,
        costo_consegna: costoConsegna,
        // Esegue: tempo_attesa: tempoAttesa
        tempo_attesa: tempoAttesa
      // Esegue: };
      };

      // Esegue: const insertResult = await db.collection("orders").insertOne(newOrder);
      const insertResult = await db.collection("orders").insertOne(newOrder);
      // Esegue: return { ...newOrder, _id: insertResult.insertedId };
      return { ...newOrder, _id: insertResult.insertedId };
    // Esegue: }));
    }));

    // Esegue: res.status(201).json({ message: "Ordini creati con successo.", orders: results });
    res.status(201).json({ message: "Ordini creati con successo.", orders: results });

  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: `Errore nella creazione dell'ordine: ${err.message}` });
    res.status(500).json({ error: `Errore nella creazione dell'ordine: ${err.message}` });
  // Esegue: }
  }
// Esegue: });
});


// PUT /orders/:id - Modifica stato ordine (Richiede autenticazione ristoratore)
// Esegue: ordersRouter.put("/:id", authenticateUser, authorizeRistoratore, async (req, res) => {
ordersRouter.put("/:id", authenticateUser, authorizeRistoratore, async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const user = req.user;
    const user = req.user;
    // Esegue: const id = req.params.id;
    const id = req.params.id;

    // Esegue: if (!ObjectId.isValid(id)) {
    if (!ObjectId.isValid(id)) {
      // Esegue: return res.status(400).json({ error: "ID ordine non valido" });
      return res.status(400).json({ error: "ID ordine non valido" });
    // Esegue: }
    }

    // Esegue: if (user.role !== "ristoratore") {
    if (user.role !== "ristoratore") {
      // Esegue: return res.status(403).json({ error: "Solo i ristoratori possono modificare lo stato" });
      return res.status(403).json({ error: "Solo i ristoratori possono modificare lo stato" });
    // Esegue: }
    }

    // Esegue: const ristorante = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user...
    const ristorante = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user._id) });
    // Esegue: if (!ristorante) return res.status(404).json({ error: "Ristorante non trovato" });
    if (!ristorante) return res.status(404).json({ error: "Ristorante non trovato" });

    // Esegue: const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });
    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });
    // Esegue: if (!order) return res.status(404).json({ error: "Ordine non trovato" });
    if (!order) return res.status(404).json({ error: "Ordine non trovato" });

    // Esegue: if (order.ristorante_id.toString() !== ristorante._id.toString()) {
    if (order.ristorante_id.toString() !== ristorante._id.toString()) {
      // Esegue: return res.status(403).json({ error: "Non puoi modificare ordini di altri ristoranti" });
      return res.status(403).json({ error: "Non puoi modificare ordini di altri ristoranti" });
    // Esegue: }
    }

    // Esegue: const currentStateIndex = validStates.indexOf(order.stato);
    const currentStateIndex = validStates.indexOf(order.stato);
    // Esegue: if (order.metodo_consegna === "Ritiro in ristorante") {
    if (order.metodo_consegna === "Ritiro in ristorante") {
      // Esegue: if (currentStateIndex === 3) {
      if (currentStateIndex === 3) {
        // Esegue: return res.status(400).json({ error: "Ordine già consegnato" });
        return res.status(400).json({ error: "Ordine già consegnato" });
      // Esegue: }
      }
      // Esegue: const nuovoStato = currentStateIndex === 1 ? validStates[currentStateIndex + 2] : validStates[cur...
      const nuovoStato = currentStateIndex === 1 ? validStates[currentStateIndex + 2] : validStates[currentStateIndex + 1];
      // Esegue: await db.collection("orders").updateOne({ _id: new ObjectId(id) }, { $set: { stato: nuovoStato } });
      await db.collection("orders").updateOne({ _id: new ObjectId(id) }, { $set: { stato: nuovoStato } });
    // Esegue: } else {
    } else {
      // Esegue: if (currentStateIndex >= 2) {
      if (currentStateIndex >= 2) {
        // Esegue: return res.status(400).json({ error: "Solo il cliente può confermare la ricezione" });
        return res.status(400).json({ error: "Solo il cliente può confermare la ricezione" });
      // Esegue: }
      }
      // Esegue: const nuovoStato = validStates[currentStateIndex + 1];
      const nuovoStato = validStates[currentStateIndex + 1];
      // Esegue: await db.collection("orders").updateOne({ _id: new ObjectId(id) }, { $set: { stato: nuovoStato } });
      await db.collection("orders").updateOne({ _id: new ObjectId(id) }, { $set: { stato: nuovoStato } });
    // Esegue: }
    }

    // Esegue: res.json({ message: "Stato ordine aggiornato correttamente." });
    res.json({ message: "Stato ordine aggiornato correttamente." });

  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nell'aggiornamento ordine" });
    res.status(500).json({ error: "Errore nell'aggiornamento ordine" });
  // Esegue: }
  }
// Esegue: });
});

// GET /orders - Lista ordini (Cliente solo propri, Ristoratore solo quelli relativi al suo ristorante)
// Esegue: ordersRouter.get("/", authenticateUser, async (req, res) => {
ordersRouter.get("/", authenticateUser, async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const user = req.user;
    const user = req.user;

    // Esegue: const filter = {};
    const filter = {};
    // Esegue: if (user.role === "cliente") {
    if (user.role === "cliente") {
      // Esegue: filter.cliente_id = new ObjectId(user._id);
      filter.cliente_id = new ObjectId(user._id);
    // Esegue: } else if (user.role === "ristoratore") {
    } else if (user.role === "ristoratore") {
      // Esegue: const ristorante = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user...
      const ristorante = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user._id) });
      // Esegue: if (!ristorante) return res.status(404).json({ error: "Ristorante non trovato" });
      if (!ristorante) return res.status(404).json({ error: "Ristorante non trovato" });

      // Esegue: filter.ristorante_id = new ObjectId(ristorante._id);
      filter.ristorante_id = new ObjectId(ristorante._id);
    // Esegue: } else {
    } else {
      // Esegue: return res.status(403).json({ error: "Accesso negato" });
      return res.status(403).json({ error: "Accesso negato" });
    // Esegue: }
    }

    // Esegue: const orders = await db.collection("orders").find(filter).toArray();
    const orders = await db.collection("orders").find(filter).toArray();

    // Esegue: if (user.role === "ristoratore") {
    if (user.role === "ristoratore") {
      // Esegue: const ordiniConNotificaConsegna = orders
      const ordiniConNotificaConsegna = orders
        // Esegue: .filter(order => order.notifica_ristoratore_consegna === true)
        .filter(order => order.notifica_ristoratore_consegna === true)
        // Esegue: .map(order => order._id);
        .map(order => order._id);

      // Esegue: if (ordiniConNotificaConsegna.length > 0) {
      if (ordiniConNotificaConsegna.length > 0) {
        // Esegue: await db.collection("orders").updateMany(
        await db.collection("orders").updateMany(
          // Esegue: { _id: { $in: ordiniConNotificaConsegna } },
          { _id: { $in: ordiniConNotificaConsegna } },
          // Esegue: { $set: { notifica_ristoratore_consegna: false } }
          { $set: { notifica_ristoratore_consegna: false } }
        // Esegue: );
        );
      // Esegue: }
      }
    // Esegue: }
    }

    // Esegue: for (const order of orders) {
    for (const order of orders) {
      // Esegue: const ristorante = await db.collection("restaurants").findOne({ _id: order.ristorante_id });
      const ristorante = await db.collection("restaurants").findOne({ _id: order.ristorante_id });
      // Esegue: order.ristorante_nome = ristorante ? ristorante.name : "Ristorante Sconosciuto";
      order.ristorante_nome = ristorante ? ristorante.name : "Ristorante Sconosciuto";
    // Esegue: }
    }

    // Esegue: res.json(orders);
    res.json(orders);
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nel recupero ordini" });
    res.status(500).json({ error: "Errore nel recupero ordini" });
  // Esegue: }
  }
// Esegue: });
});

// PUT /orders/notifiche-consegna/ack - Segna come lette le notifiche consegna a domicilio per il ristoratore
// Esegue: ordersRouter.put("/notifiche-consegna/ack", authenticateUser, authorizeRistoratore, async (req, r...
ordersRouter.put("/notifiche-consegna/ack", authenticateUser, authorizeRistoratore, async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const user = req.user;
    const user = req.user;

    // Esegue: if (user.role !== "ristoratore") {
    if (user.role !== "ristoratore") {
      // Esegue: return res.status(403).json({ error: "Solo i ristoratori possono confermare le notifiche" });
      return res.status(403).json({ error: "Solo i ristoratori possono confermare le notifiche" });
    // Esegue: }
    }

    // Esegue: const ristorante = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user...
    const ristorante = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user._id) });
    // Esegue: if (!ristorante) return res.status(404).json({ error: "Ristorante non trovato" });
    if (!ristorante) return res.status(404).json({ error: "Ristorante non trovato" });

    // Esegue: await db.collection("orders").updateMany(
    await db.collection("orders").updateMany(
      // Esegue: {
      {
        // Esegue: ristorante_id: new ObjectId(ristorante._id),
        ristorante_id: new ObjectId(ristorante._id),
        // Esegue: metodo_consegna: "Consegna a domicilio",
        metodo_consegna: "Consegna a domicilio",
        // Esegue: notifica_ristoratore_consegna: true
        notifica_ristoratore_consegna: true
      // Esegue: },
      },
      // Esegue: { $set: { notifica_ristoratore_consegna: false } }
      { $set: { notifica_ristoratore_consegna: false } }
    // Esegue: );
    );

    // Esegue: res.json({ message: "Notifiche consegna confermate." });
    res.json({ message: "Notifiche consegna confermate." });
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nella conferma notifiche consegna" });
    res.status(500).json({ error: "Errore nella conferma notifiche consegna" });
  // Esegue: }
  }
// Esegue: });
});


// GET /orders/:id - Dettagli singolo ordine (Cliente solo propri, Ristoratore solo quelli relativi al suo ristorante)
// Esegue: ordersRouter.get("/:id", authenticateUser, async (req, res) => {
ordersRouter.get("/:id", authenticateUser, async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const user = req.user;
    const user = req.user;
    // Esegue: const id = req.params.id;
    const id = req.params.id;

    // Esegue: if (!ObjectId.isValid(id)) {
    if (!ObjectId.isValid(id)) {
      // Esegue: return res.status(400).json({ error: "ID ordine non valido" });
      return res.status(400).json({ error: "ID ordine non valido" });
    // Esegue: }
    }

    // Esegue: const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });
    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });

    // Esegue: if (!order) return res.status(404).json({ error: "Ordine non trovato" });
    if (!order) return res.status(404).json({ error: "Ordine non trovato" });

    // Esegue: if (user.role === "cliente" && order.cliente_id.toString() !== user._id) {
    if (user.role === "cliente" && order.cliente_id.toString() !== user._id) {
      // Esegue: return res.status(403).json({ error: "Accesso negato all'ordine" });
      return res.status(403).json({ error: "Accesso negato all'ordine" });
    // Esegue: }
    }

    // Esegue: if (user.role === "ristoratore") {
    if (user.role === "ristoratore") {
      // Esegue: const ristorante = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user...
      const ristorante = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user._id) });
      // Esegue: if (!ristorante) {
      if (!ristorante) {
        // Esegue: return res.status(404).json({ error: "Ristorante non trovato" });
        return res.status(404).json({ error: "Ristorante non trovato" });
      // Esegue: }
      }

      // Esegue: if (order.ristorante_id.toString() !== ristorante._id.toString()) {
      if (order.ristorante_id.toString() !== ristorante._id.toString()) {
        // Esegue: return res.status(403).json({ error: "Accesso negato all'ordine" });
        return res.status(403).json({ error: "Accesso negato all'ordine" });
      // Esegue: }
      }
    // Esegue: }
    }

    // Esegue: if (!["cliente", "ristoratore"].includes(user.role)) {
    if (!["cliente", "ristoratore"].includes(user.role)) {
      // Esegue: return res.status(403).json({ error: "Accesso negato all'ordine" });
      return res.status(403).json({ error: "Accesso negato all'ordine" });
    // Esegue: }
    }

    // Esegue: res.json(order);
    res.json(order);
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nel recupero ordine" });
    res.status(500).json({ error: "Errore nel recupero ordine" });
  // Esegue: }
  }
// Esegue: });
});


// PUT /orders/:id/consegna - Conferma consegna da parte del cliente (per ordini con consegna a domicilio)
// Esegue: ordersRouter.put("/:id/consegna", authenticateUser, async (req, res) => {
ordersRouter.put("/:id/consegna", authenticateUser, async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const user = req.user;
    const user = req.user;
    // Esegue: const id = req.params.id;
    const id = req.params.id;

    // Esegue: if (!ObjectId.isValid(id)) {
    if (!ObjectId.isValid(id)) {
      // Esegue: return res.status(400).json({ error: "ID ordine non valido" });
      return res.status(400).json({ error: "ID ordine non valido" });
    // Esegue: }
    }

    // Esegue: if (user.role !== "cliente") {
    if (user.role !== "cliente") {
      // Esegue: return res.status(403).json({ error: "Solo i clienti possono confermare la consegna" });
      return res.status(403).json({ error: "Solo i clienti possono confermare la consegna" });
    // Esegue: }
    }

    // Esegue: const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });
    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });

    // Esegue: if (!order) return res.status(404).json({ error: "Ordine non trovato" });
    if (!order) return res.status(404).json({ error: "Ordine non trovato" });
    // Esegue: if (order.cliente_id.toString() !== user._id) {
    if (order.cliente_id.toString() !== user._id) {
      // Esegue: return res.status(403).json({ error: "Non puoi modificare ordini di altri clienti" });
      return res.status(403).json({ error: "Non puoi modificare ordini di altri clienti" });
    // Esegue: }
    }

    // Esegue: if (order.stato !== "in consegna") {
    if (order.stato !== "in consegna") {
      // Esegue: return res.status(400).json({ error: "Puoi confermare la consegna solo se l'ordine è 'in consegna...
      return res.status(400).json({ error: "Puoi confermare la consegna solo se l'ordine è 'in consegna'" });
    // Esegue: }
    }

    // Esegue: const updatedOrder = await db.collection("orders").findOneAndUpdate(
    const updatedOrder = await db.collection("orders").findOneAndUpdate(
      // Esegue: { _id: new ObjectId(id) },
      { _id: new ObjectId(id) },
      // Esegue: { $set: { stato: "consegnato", notifica_ristoratore_consegna: true } },
      { $set: { stato: "consegnato", notifica_ristoratore_consegna: true } },
      // Esegue: { returnDocument: "after" }
      { returnDocument: "after" }
    // Esegue: );
    );

    // Esegue: res.json(updatedOrder);
    res.json(updatedOrder);
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nella conferma consegna" });
    res.status(500).json({ error: "Errore nella conferma consegna" });
  // Esegue: }
  }
// Esegue: });
});


// Esegue: export default ordersRouter;
export default ordersRouter;
