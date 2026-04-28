/**
 * Analisi file: carts.js.
 * Questo modulo gestisce una parte specifica dell'applicazione Fast Food.
 */
// Esegue: import express from "express";
import express from "express";
// Esegue: import authenticateUser from "../middlewares/authenticateUser.js";
import authenticateUser from "../middlewares/authenticateUser.js";
// Esegue: import { ObjectId } from "mongodb";
import { ObjectId } from "mongodb";

/*Express.js è un framework per Node.js, che fornisce una serie di strumenti utili alla creazione di API, Middlewares, e per la semplificazione delle operazioni di routing*/

// Esegue: const cartsRouter = express.Router(); //definiamo un oggetto Router
const cartsRouter = express.Router(); //definiamo un oggetto Router

/*Per Routing si intende determinare come la mia app risponde a richieste client, in base all'endpoint a cui vengono effettuate (Endpoint definire come URI + Metodo HTTP specifico)
  Vogliamo quindi definire un comportamento diverso del backend, in base all'URI e al metodo HTTP a cui vengono effettuate le richieste client.
  
  Definiamo una rotta:
  Router.HTTPMETHOD(URI, HANDLERFUNCTION)
  Dove HTTPMETHOD è un metodo di richiesta HTTP,
  URI è un percorso sul server
  HANDLER è la funzione che viene eseguita quando arriva una richiesta client all'URI specificato, col metodo METHOD*/

// Esegue: cartsRouter.get("/me", authenticateUser, async (req, res) => {
cartsRouter.get("/me", authenticateUser, async (req, res) => {
    // Esegue: try {
    try {
      // Esegue: const db = req.app.locals.db;
      const db = req.app.locals.db;
      // Esegue: const cart = await db.collection("carts").findOne({ user_id: new ObjectId(req.user._id) });
      const cart = await db.collection("carts").findOne({ user_id: new ObjectId(req.user._id) });
  
      // Esegue: if (!cart) return res.status(404).json({ error: "Carrello vuoto o non trovato." });
      if (!cart) return res.status(404).json({ error: "Carrello vuoto o non trovato." });
  
      // Esegue: res.json(cart);
      res.json(cart);
    // Esegue: } catch (err) {
    } catch (err) {
      // Esegue: console.error(err);
      console.error(err);
      // Esegue: res.status(500).json({ error: "Errore nel recupero del carrello" });
      res.status(500).json({ error: "Errore nel recupero del carrello" });
    // Esegue: }
    }
  // Esegue: });
  });
  
  //PUT /add - Aggiunge un piatto al carrello dell'utente autenticato, creando il carrello se non esistente
  // Esegue: cartsRouter.put("/add", authenticateUser, async (req, res) => {
  cartsRouter.put("/add", authenticateUser, async (req, res) => {
    // Esegue: try {
    try {
      // Esegue: const db = req.app.locals.db;
      const db = req.app.locals.db;
      // Esegue: const { meal_id, quantita, prezzo_unitario, ristorante_id, nome } = req.body;
      const { meal_id, quantita, prezzo_unitario, ristorante_id, nome } = req.body;
  
      // Esegue: if (!meal_id || !ObjectId.isValid(meal_id)) {
      if (!meal_id || !ObjectId.isValid(meal_id)) {
        // Esegue: return res.status(400).json({ error: "_id del piatto non valido" });
        return res.status(400).json({ error: "_id del piatto non valido" });
      // Esegue: }
      }
  
      // Esegue: if (!ristorante_id || !ObjectId.isValid(ristorante_id)) {
      if (!ristorante_id || !ObjectId.isValid(ristorante_id)) {
        // Esegue: return res.status(400).json({ error: "ristorante_id non valido" });
        return res.status(400).json({ error: "ristorante_id non valido" });
      // Esegue: }
      }
  
      // Esegue: let cart = await db.collection("carts").findOne({ user_id: new ObjectId(req.user._id) });
      let cart = await db.collection("carts").findOne({ user_id: new ObjectId(req.user._id) });
  
      // Esegue: if (!cart) {
      if (!cart) {
        // Esegue: cart = { user_id: new ObjectId(req.user._id), meals: [] };
        cart = { user_id: new ObjectId(req.user._id), meals: [] };
      // Esegue: }
      }
  
      // Esegue: const mealIndex = cart.meals.findIndex(m => m._id.toString() === meal_id && m.ristorante_id.toStr...
      const mealIndex = cart.meals.findIndex(m => m._id.toString() === meal_id && m.ristorante_id.toString() === ristorante_id);
  
      // Esegue: if (mealIndex !== -1) {
      if (mealIndex !== -1) {
        // Esegue: cart.meals[mealIndex].quantita += quantita;
        cart.meals[mealIndex].quantita += quantita;
      // Esegue: } else {
      } else {
        // Esegue: cart.meals.push({
        cart.meals.push({
          // Esegue: _id: new ObjectId(meal_id),
          _id: new ObjectId(meal_id),
          // Esegue: nome,
          nome,
          // Esegue: quantita,
          quantita,
          // Esegue: prezzo_unitario,
          prezzo_unitario,
          // Esegue: ristorante_id: new ObjectId(ristorante_id)
          ristorante_id: new ObjectId(ristorante_id)
        // Esegue: });
        });
      // Esegue: }
      }
  
      // Esegue: await db.collection("carts").updateOne(
      await db.collection("carts").updateOne(
        // Esegue: { user_id: new ObjectId(req.user._id) },
        { user_id: new ObjectId(req.user._id) },
        // Esegue: { $set: cart },
        { $set: cart },
        // Esegue: { upsert: true }
        { upsert: true }
      // Esegue: );
      );
  
      // Esegue: res.json(cart);
      res.json(cart);
    // Esegue: } catch (err) {
    } catch (err) {
      // Esegue: console.error(err);
      console.error(err);
      // Esegue: res.status(500).json({ error: "Errore nell'aggiunta al carrello" });
      res.status(500).json({ error: "Errore nell'aggiunta al carrello" });
    // Esegue: }
    }
  // Esegue: });
  });
  
  // PUT /carts/remove - Rimuovi un piatto dal carrello dell'utente autenticato, eliminando il carrello se rimane vuoto
  // Esegue: cartsRouter.put("/remove", authenticateUser, async (req, res) => {
  cartsRouter.put("/remove", authenticateUser, async (req, res) => {
    // Esegue: try {
    try {
      // Esegue: const db = req.app.locals.db;
      const db = req.app.locals.db;
      // Esegue: const { meal_id } = req.body;
      const { meal_id } = req.body;
  
      // Esegue: if (!meal_id || !ObjectId.isValid(meal_id)) {
      if (!meal_id || !ObjectId.isValid(meal_id)) {
        // Esegue: return res.status(400).json({ error: "_id del piatto non valido" });
        return res.status(400).json({ error: "_id del piatto non valido" });
      // Esegue: }
      }
  
      // Esegue: const cart = await db.collection("carts").findOne({ user_id: new ObjectId(req.user._id) });
      const cart = await db.collection("carts").findOne({ user_id: new ObjectId(req.user._id) });
  
      // Esegue: if (!cart || cart.meals.length === 0) {
      if (!cart || cart.meals.length === 0) {
        // Esegue: return res.status(404).json({ error: "Carrello vuoto o non trovato" });
        return res.status(404).json({ error: "Carrello vuoto o non trovato" });
      // Esegue: }
      }
      
      //tutti i piatti, tranne quello identificato per l'eliminazione
      // Esegue: cart.meals = cart.meals.filter(m => m._id.toString() !== meal_id);
      cart.meals = cart.meals.filter(m => m._id.toString() !== meal_id);
  
      // Esegue: if (cart.meals.length === 0) {
      if (cart.meals.length === 0) {
        // Esegue: await db.collection("carts").deleteOne({ user_id: new ObjectId(req.user._id) });
        await db.collection("carts").deleteOne({ user_id: new ObjectId(req.user._id) });
        // Esegue: return res.json({ message: "Carrello eliminato poiché vuoto." });
        return res.json({ message: "Carrello eliminato poiché vuoto." });
      // Esegue: } else {
      } else {
        // Esegue: await db.collection("carts").updateOne(
        await db.collection("carts").updateOne(
          // Esegue: { user_id: new ObjectId(req.user._id) },
          { user_id: new ObjectId(req.user._id) },
          // Esegue: { $set: { meals: cart.meals } }
          { $set: { meals: cart.meals } }
        // Esegue: );
        );
        // Esegue: return res.json(cart);
        return res.json(cart);
      // Esegue: }
      }
  
    // Esegue: } catch (err) {
    } catch (err) {
      // Esegue: console.error(err);
      console.error(err);
      // Esegue: res.status(500).json({ error: "Errore nella rimozione dal carrello" });
      res.status(500).json({ error: "Errore nella rimozione dal carrello" });
    // Esegue: }
    }
  // Esegue: });
  });
  
  
  
  // DELETE /carts/me - Elimina tutto il carrello
  // Esegue: cartsRouter.delete("/me", authenticateUser, async (req, res) => {
  cartsRouter.delete("/me", authenticateUser, async (req, res) => {
    // Esegue: try {
    try {
      // Esegue: const db = req.app.locals.db;
      const db = req.app.locals.db;
      // Esegue: await db.collection("carts").deleteOne({ user_id: new ObjectId(req.user._id) });
      await db.collection("carts").deleteOne({ user_id: new ObjectId(req.user._id) });
      // Esegue: res.json({ message: "Carrello eliminato correttamente." });
      res.json({ message: "Carrello eliminato correttamente." });
    // Esegue: } catch (err) {
    } catch (err) {
      // Esegue: console.error(err);
      console.error(err);
      // Esegue: res.status(500).json({ error: "Errore durante l'eliminazione del carrello" });
      res.status(500).json({ error: "Errore durante l'eliminazione del carrello" });
    // Esegue: }
    }
  // Esegue: });
  });
  
  // Esegue: export default cartsRouter;
  export default cartsRouter;
