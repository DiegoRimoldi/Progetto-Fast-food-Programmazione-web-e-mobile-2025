/*
  Router dedicato alla gestione carrello.
  Definisce endpoint per leggere, creare, aggiornare e svuotare il carrello
  dell'utente autenticato, orchestrando validazioni e accesso al database.
*/

// SEZIONE: Import dei moduli necessari al file.
import express from "express";
import authenticateUser from "../middlewares/authenticateUser.js";
import { ObjectId } from "mongodb";

/*Express.js è un framework per Node.js, che fornisce una serie di strumenti utili alla creazione di API, Middlewares, e per la semplificazione delle operazioni di routing*/

// SEZIONE: Dichiarazione di costanti, middleware locali o oggetti di supporto.
const cartsRouter = express.Router(); //definiamo un oggetto Router

/*Per Routing si intende determinare come la mia app risponde a richieste client, in base all'endpoint a cui vengono effettuate (Endpoint definire come URI + Metodo HTTP specifico)
  Vogliamo quindi definire un comportamento diverso del backend, in base all'URI e al metodo HTTP a cui vengono effettuate le richieste client.
  
  Definiamo una rotta:
  Router.HTTPMETHOD(URI, HANDLERFUNCTION)
  Dove HTTPMETHOD è un metodo di richiesta HTTP,
  URI è un percorso sul server
  HANDLER è la funzione che viene eseguita quando arriva una richiesta client all'URI specificato, col metodo METHOD*/

cartsRouter
// SEZIONE ROUTING: Gestione endpoint HTTP con relativa logica applicativa.
.get("/me", authenticateUser, async (req, res) => {
    try {
      const db = req.app.locals.db;
      const cart = await db.collection("carts").findOne({ user_id: new ObjectId(req.user._id) });
  
      if (!cart) return res.status(404).json({ error: "Carrello vuoto o non trovato." });
  
      res.json(cart);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Errore nel recupero del carrello" });
    }
  });
  
  // POST /carts/me/items - Aggiunge un piatto al carrello dell'utente autenticato, creando il carrello se non esistente
  cartsRouter
// SEZIONE ROUTING: Gestione endpoint HTTP con relativa logica applicativa.
.post("/me/items", authenticateUser, async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { meal_id, quantita, prezzo_unitario, prezzo_originale, in_offerta, sconto_percentuale, ristorante_id, nome } = req.body;
  
      if (!meal_id || !ObjectId.isValid(meal_id)) {
        return res.status(400).json({ error: "_id del piatto non valido" });
      }
  
      if (!ristorante_id || !ObjectId.isValid(ristorante_id)) {
        return res.status(400).json({ error: "ristorante_id non valido" });
      }
  
      let cart = await db.collection("carts").findOne({ user_id: new ObjectId(req.user._id) });
  
      if (!cart) {
        cart = { user_id: new ObjectId(req.user._id), meals: [] };
      }
  
      const mealIndex = cart.meals.findIndex(m => m._id.toString() === meal_id && m.ristorante_id.toString() === ristorante_id);
  
      if (mealIndex !== -1) {
        cart.meals[mealIndex].quantita += quantita;
        cart.meals[mealIndex].prezzo_unitario = prezzo_unitario;
        cart.meals[mealIndex].prezzo_originale = prezzo_originale ?? null;
        cart.meals[mealIndex].in_offerta = Boolean(in_offerta);
        cart.meals[mealIndex].sconto_percentuale = Number(sconto_percentuale || 0);
      } else {
        cart.meals.push({
          _id: new ObjectId(meal_id),
          nome,
          quantita,
          prezzo_unitario,
          prezzo_originale: prezzo_originale ?? null,
          in_offerta: Boolean(in_offerta),
          sconto_percentuale: Number(sconto_percentuale || 0),
          ristorante_id: new ObjectId(ristorante_id)
        });
      }
  
      await db.collection("carts").updateOne(
        { user_id: new ObjectId(req.user._id) },
        { $set: cart },
        { upsert: true }
      );
  
      res.json(cart);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Errore nell'aggiunta al carrello" });
    }
  });
  
  // DELETE /carts/me/items/:mealId - Rimuovi un piatto dal carrello dell'utente autenticato, eliminando il carrello se rimane vuoto
  cartsRouter
// SEZIONE ROUTING: Gestione endpoint HTTP con relativa logica applicativa.
.delete("/me/items/:mealId", authenticateUser, async (req, res) => {
    try {
      const db = req.app.locals.db;
      const meal_id = req.params.mealId;
  
      if (!meal_id || !ObjectId.isValid(meal_id)) {
        return res.status(400).json({ error: "_id del piatto non valido" });
      }
  
      const cart = await db.collection("carts").findOne({ user_id: new ObjectId(req.user._id) });
  
      if (!cart || cart.meals.length === 0) {
        return res.status(404).json({ error: "Carrello vuoto o non trovato" });
      }
      
      //tutti i piatti, tranne quello identificato per l'eliminazione
      cart.meals = cart.meals.filter(m => m._id.toString() !== meal_id);
  
      if (cart.meals.length === 0) {
        await db.collection("carts").deleteOne({ user_id: new ObjectId(req.user._id) });
        return res.json({ message: "Carrello eliminato poiché vuoto." });
      } else {
        await db.collection("carts").updateOne(
          { user_id: new ObjectId(req.user._id) },
          { $set: { meals: cart.meals } }
        );
        return res.json(cart);
      }
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Errore nella rimozione dal carrello" });
    }
  });
  
  
  
  // DELETE /carts/me - Elimina tutto il carrello
  cartsRouter
// SEZIONE ROUTING: Gestione endpoint HTTP con relativa logica applicativa.
.delete("/me", authenticateUser, async (req, res) => {
    try {
      const db = req.app.locals.db;
      await db.collection("carts").deleteOne({ user_id: new ObjectId(req.user._id) });
      res.json({ message: "Carrello eliminato correttamente." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Errore durante l'eliminazione del carrello" });
    }
  });
  
  // Endpoint legacy mantenuti per retrocompatibilità (non pienamente REST)
  cartsRouter
// SEZIONE ROUTING: Gestione endpoint HTTP con relativa logica applicativa.
.put("/add", authenticateUser, async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { meal_id, quantita, prezzo_unitario, prezzo_originale, in_offerta, sconto_percentuale, ristorante_id, nome } = req.body;

      if (!meal_id || !ObjectId.isValid(meal_id)) {
        return res.status(400).json({ error: "_id del piatto non valido" });
      }

      if (!ristorante_id || !ObjectId.isValid(ristorante_id)) {
        return res.status(400).json({ error: "ristorante_id non valido" });
      }

      let cart = await db.collection("carts").findOne({ user_id: new ObjectId(req.user._id) });
      if (!cart) cart = { user_id: new ObjectId(req.user._id), meals: [] };

      const mealIndex = cart.meals.findIndex(m => m._id.toString() === meal_id && m.ristorante_id.toString() === ristorante_id);
      if (mealIndex !== -1) {
        cart.meals[mealIndex].quantita += quantita;
        cart.meals[mealIndex].prezzo_unitario = prezzo_unitario;
        cart.meals[mealIndex].prezzo_originale = prezzo_originale ?? null;
        cart.meals[mealIndex].in_offerta = Boolean(in_offerta);
        cart.meals[mealIndex].sconto_percentuale = Number(sconto_percentuale || 0);
      } else {
        cart.meals.push({ _id: new ObjectId(meal_id), nome, quantita, prezzo_unitario, prezzo_originale: prezzo_originale ?? null, in_offerta: Boolean(in_offerta), sconto_percentuale: Number(sconto_percentuale || 0), ristorante_id: new ObjectId(ristorante_id) });
      }

      await db.collection("carts").updateOne({ user_id: new ObjectId(req.user._id) }, { $set: cart }, { upsert: true });
      res.json(cart);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Errore nell'aggiunta al carrello" });
    }
  });

  cartsRouter
// SEZIONE ROUTING: Gestione endpoint HTTP con relativa logica applicativa.
.put("/remove", authenticateUser, async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { meal_id } = req.body;
      if (!meal_id || !ObjectId.isValid(meal_id)) return res.status(400).json({ error: "_id del piatto non valido" });
      const cart = await db.collection("carts").findOne({ user_id: new ObjectId(req.user._id) });
      if (!cart || cart.meals.length === 0) return res.status(404).json({ error: "Carrello vuoto o non trovato" });
      cart.meals = cart.meals.filter(m => m._id.toString() !== meal_id);
      if (cart.meals.length === 0) {
        await db.collection("carts").deleteOne({ user_id: new ObjectId(req.user._id) });
        return res.json({ message: "Carrello eliminato poiché vuoto." });
      }
      await db.collection("carts").updateOne({ user_id: new ObjectId(req.user._id) }, { $set: { meals: cart.meals } });
      return res.json(cart);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Errore nella rimozione dal carrello" });
    }
  });

  
// SEZIONE EXPORT: Esportiamo il modulo per renderlo riutilizzabile nel progetto.
export default cartsRouter;
