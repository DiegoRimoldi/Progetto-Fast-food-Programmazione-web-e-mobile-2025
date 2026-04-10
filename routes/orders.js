import express from "express";
import { ObjectId } from "mongodb";
import authenticateUser from "../middlewares/authenticateUser.js";
import authorizeRistoratore from "../middlewares/authorizeRistoratore.js";
import { DateTime } from "luxon";

const ordersRouter = express.Router();
const validStates = ["ordinato", "in preparazione", "in consegna", "consegnato"];
const DELIVERY_COST_PER_KM = 0.7;
const DELIVERY_BASE_COST = 1.5;

async function geocodeAddress(address) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "FastFoodProject/1.0 (A.A.2025-2026)"
    }
  });

  if (!response.ok) {
    throw new Error(`Errore geocoding OpenStreetMap: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Indirizzo non trovato: ${address}`);
  }

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon)
  };
}

function haversineKm(coord1, coord2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lon - coord1.lon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// POST /orders - Crea nuovo ordine per l'utente autenticato
ordersRouter.post("/", authenticateUser, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = req.user;

    if (user.role !== "cliente") {
      return res.status(403).json({ error: "Solo i clienti possono creare ordini" });
    }

    const { meals, metodo_consegna, indirizzo_consegna } = req.body;

    if (!Array.isArray(meals) || meals.length === 0) {
      return res.status(400).json({ error: "meals deve essere un array non vuoto" });
    }

    if (!["Ritiro in ristorante", "Consegna a domicilio"].includes(metodo_consegna)) {
      return res.status(400).json({ error: "metodo_consegna non valido" });
    }

    const ordiniPerRistoranti = {};

    for (const m of meals) {
      if (!m.ristorante_id || !ObjectId.isValid(m.ristorante_id)) {
        return res.status(400).json({ error: `ristorante_id mancante o non valido per il piatto: ${m.nome}` });
      }

      const ristoranteId = new ObjectId(m.ristorante_id).toString();
      ordiniPerRistoranti[ristoranteId] = ordiniPerRistoranti[ristoranteId] || [];
      ordiniPerRistoranti[ristoranteId].push({
        _id: new ObjectId(m._id),
        nome: m.nome,
        quantita: m.quantita,
        prezzo_unitario: m.prezzo_unitario,
        tempo_preparazione: m.tempo_preparazione || 10
      });
    }

    const utente = await db.collection("users").findOne({ _id: new ObjectId(user._id) });
    if (!utente) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    if (metodo_consegna === "Consegna a domicilio" && !(indirizzo_consegna || utente.indirizzo)) {
      return res.status(400).json({ error: "Indirizzo di consegna mancante" });
    }

    const results = await Promise.all(Object.keys(ordiniPerRistoranti).map(async (ristoranteId) => {
      let totale = 0;
      let tempoAttesa = 0;
      let costoConsegna = 0;
      let distanzaKm = 0;

      ordiniPerRistoranti[ristoranteId].forEach((meal) => {
        totale += meal.quantita * meal.prezzo_unitario;
        tempoAttesa += meal.quantita * meal.tempo_preparazione;
      });

      const ordiniRistorante = await db.collection("orders").find({
        ristorante_id: new ObjectId(ristoranteId),
        stato: { $ne: "consegnato" }
      }).toArray();

      const ristorante = await db.collection("restaurants").findOne({ _id: new ObjectId(ristoranteId) });
      if (!ristorante) {
        throw new Error(`Ristorante non trovato per id ${ristoranteId}`);
      }

      // ordine va direttamente in preparazione se è il primo della coda del ristorante
      const stato = ordiniRistorante.length === 0 ? "in preparazione" : "ordinato";

      ordiniRistorante.forEach((o) => {
        if (["in preparazione", "ordinato"].includes(o.stato)) {
          tempoAttesa += o.tempo_attesa;
        }
      });

      const indirizzoEffettivo = indirizzo_consegna || utente.indirizzo;
      if (metodo_consegna === "Consegna a domicilio") {
        const [coordRistorante, coordConsegna] = await Promise.all([
          geocodeAddress(ristorante.address),
          geocodeAddress(indirizzoEffettivo)
        ]);
        distanzaKm = Number(haversineKm(coordRistorante, coordConsegna).toFixed(2));
        costoConsegna = Number((DELIVERY_BASE_COST + (distanzaKm * DELIVERY_COST_PER_KM)).toFixed(2));
        totale += costoConsegna;
      }

      const newOrder = {
        cliente_id: new ObjectId(utente._id),
        cliente_nome: utente.username,
        ristorante_id: new ObjectId(ristoranteId),
        meals: ordiniPerRistoranti[ristoranteId],
        totale,
        stato,
        data_ordine: DateTime.now().setZone("Europe/Rome").toFormat("dd/MM/yyyy - HH:mm"),
        metodo_consegna,
        indirizzo_consegna: metodo_consegna === "Consegna a domicilio" ? indirizzoEffettivo : null,
        distanza_km: distanzaKm,
        costo_consegna: costoConsegna,
        tempo_attesa: tempoAttesa
      };

      const insertResult = await db.collection("orders").insertOne(newOrder);
      return { ...newOrder, _id: insertResult.insertedId };
    }));

    res.status(201).json({ message: "Ordini creati con successo.", orders: results });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Errore nella creazione dell'ordine: ${err.message}` });
  }
});


// PUT /orders/:id - Modifica stato ordine (Richiede autenticazione ristoratore)
ordersRouter.put("/:id", authenticateUser, authorizeRistoratore, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = req.user;
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID ordine non valido" });
    }

    if (user.role !== "ristoratore") {
      return res.status(403).json({ error: "Solo i ristoratori possono modificare lo stato" });
    }

    const ristorante = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user._id) });
    if (!ristorante) return res.status(404).json({ error: "Ristorante non trovato" });

    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });
    if (!order) return res.status(404).json({ error: "Ordine non trovato" });

    if (order.ristorante_id.toString() !== ristorante._id.toString()) {
      return res.status(403).json({ error: "Non puoi modificare ordini di altri ristoranti" });
    }

    const currentStateIndex = validStates.indexOf(order.stato);
    if (order.metodo_consegna === "Ritiro in ristorante") {
      if (currentStateIndex === 3) {
        return res.status(400).json({ error: "Ordine già consegnato" });
      }
      const nuovoStato = currentStateIndex === 1 ? validStates[currentStateIndex + 2] : validStates[currentStateIndex + 1];
      await db.collection("orders").updateOne({ _id: new ObjectId(id) }, { $set: { stato: nuovoStato } });
    } else {
      if (currentStateIndex >= 2) {
        return res.status(400).json({ error: "Solo il cliente può confermare la ricezione" });
      }
      const nuovoStato = validStates[currentStateIndex + 1];
      await db.collection("orders").updateOne({ _id: new ObjectId(id) }, { $set: { stato: nuovoStato } });
    }

    res.json({ message: "Stato ordine aggiornato correttamente." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nell'aggiornamento ordine" });
  }
});

// GET /orders - Lista ordini (Cliente solo propri, Ristoratore solo quelli relativi al suo ristorante)
ordersRouter.get("/", authenticateUser, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = req.user;

    const filter = {};
    if (user.role === "cliente") {
      filter.cliente_id = new ObjectId(user._id);
    } else if (user.role === "ristoratore") {
      const ristorante = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user._id) });
      if (!ristorante) return res.status(404).json({ error: "Ristorante non trovato" });

      filter.ristorante_id = new ObjectId(ristorante._id);
    } else {
      return res.status(403).json({ error: "Accesso negato" });
    }

    const orders = await db.collection("orders").find(filter).toArray();

    for (const order of orders) {
      const ristorante = await db.collection("restaurants").findOne({ _id: order.ristorante_id });
      order.ristorante_nome = ristorante ? ristorante.name : "Ristorante Sconosciuto";
    }

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero ordini" });
  }
});


// GET /orders/:id - Dettagli singolo ordine (Cliente solo propri, Ristoratore solo quelli relativi al suo ristorante)
ordersRouter.get("/:id", authenticateUser, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = req.user;
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID ordine non valido" });
    }

    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });

    if (!order) return res.status(404).json({ error: "Ordine non trovato" });

    if (user.role === "cliente" && order.cliente_id.toString() !== user._id) {
      return res.status(403).json({ error: "Accesso negato all'ordine" });
    }

    if (user.role === "ristoratore") {
      const ristorante = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user._id) });
      if (!ristorante) {
        return res.status(404).json({ error: "Ristorante non trovato" });
      }

      if (order.ristorante_id.toString() !== ristorante._id.toString()) {
        return res.status(403).json({ error: "Accesso negato all'ordine" });
      }
    }

    if (!["cliente", "ristoratore"].includes(user.role)) {
      return res.status(403).json({ error: "Accesso negato all'ordine" });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero ordine" });
  }
});


// PUT /orders/:id/consegna - Conferma consegna da parte del cliente (per ordini con consegna a domicilio)
ordersRouter.put("/:id/consegna", authenticateUser, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = req.user;
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID ordine non valido" });
    }

    if (user.role !== "cliente") {
      return res.status(403).json({ error: "Solo i clienti possono confermare la consegna" });
    }

    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });

    if (!order) return res.status(404).json({ error: "Ordine non trovato" });
    if (order.cliente_id.toString() !== user._id) {
      return res.status(403).json({ error: "Non puoi modificare ordini di altri clienti" });
    }

    if (order.stato !== "in consegna") {
      return res.status(400).json({ error: "Puoi confermare la consegna solo se l'ordine è 'in consegna'" });
    }

    const result = await db.collection("orders").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { stato: "consegnato" } },
      { returnDocument: "after" }
    );

    res.json(result.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella conferma consegna" });
  }
});


export default ordersRouter;
