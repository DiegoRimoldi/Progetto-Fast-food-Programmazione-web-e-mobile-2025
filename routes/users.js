/**
 * Analisi file: users.js.
 * Questo modulo gestisce una parte specifica dell'applicazione Fast Food.
 */
// Esegue: import express from "express";
import express from "express";
// Esegue: import { ObjectId } from "mongodb";
import { ObjectId } from "mongodb";
// Esegue: import bcrypt from "bcryptjs";
import bcrypt from "bcryptjs";
// Esegue: import jwt from "jsonwebtoken";
import jwt from "jsonwebtoken";
// Esegue: import authenticateUser from "../middlewares/authenticateUser.js";
import authenticateUser from "../middlewares/authenticateUser.js";
// Esegue: import { validateAddressWithOpenStreetMap } from "../utils/addressValidation.js";
import { validateAddressWithOpenStreetMap } from "../utils/addressValidation.js";

// Esegue: const usersRouter = express.Router();
const usersRouter = express.Router();

function sanitizePreferenze(preferenze) {
  if (!Array.isArray(preferenze)) return [];
  return [...new Set(
    preferenze
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
  )];
}

// GET /users - Lista utenti (filtrabile per ruolo), senza campi sensibili
// Esegue: usersRouter.get("/", async (req, res) => {
usersRouter.get("/", async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const { role } = req.query;
    const { role } = req.query;
    // Esegue: const filter = {};
    const filter = {};

    // Esegue: if (role) {
    if (role) {
      // Esegue: if (!["cliente", "ristoratore"].includes(role)) {
      if (!["cliente", "ristoratore"].includes(role)) {
        // Esegue: return res.status(400).json({ error: "role deve essere 'cliente' o 'ristoratore'" });
        return res.status(400).json({ error: "role deve essere 'cliente' o 'ristoratore'" });
      // Esegue: }
      }
      // Esegue: filter.role = role;
      filter.role = role;
    // Esegue: }
    }

    // Esegue: const users = await db.collection("users").find(
    const users = await db.collection("users").find(
      // Esegue: filter,
      filter,
      // Esegue: {
      {
        // Esegue: projection: {
        projection: {
          // Esegue: password: 0
          password: 0
        // Esegue: }
        }
      // Esegue: }
      }
    // Esegue: ).toArray();
    ).toArray();

    // Esegue: res.json({ total: users.length, users });
    res.json({ total: users.length, users });
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nel recupero utenti" });
    res.status(500).json({ error: "Errore nel recupero utenti" });
  // Esegue: }
  }
// Esegue: });
});

// POST /users/register - Registrazione utente (cliente o ristoratore)
// Esegue: usersRouter.post("/register", async (req, res) => {
usersRouter.post("/register", async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const {
    const {
      // Esegue: username,
      username,
      // Esegue: email,
      email,
      // Esegue: password,
      password,
      // Esegue: numero_di_telefono,
      numero_di_telefono,
      // Esegue: indirizzo = "",
      indirizzo = "",
      // Esegue: metodo_pagamento = "",
      metodo_pagamento = "",
      // Esegue: preferenze = [],
      preferenze = [],
      // Esegue: piva = "",
      piva = "",
      // Esegue: role
      role
    // Esegue: } = req.body;
    } = req.body;

    // Esegue: if (!username || !email || !password || !numero_di_telefono) {
    if (!username || !email || !password || !numero_di_telefono) {
      // Esegue: return res.status(400).json({ error: "username, email, password e numero di telefono sono obbliga...
      return res.status(400).json({ error: "username, email, password e numero di telefono sono obbligatori" });
    // Esegue: }
    }

    // Esegue: if (!["cliente", "ristoratore"].includes(role)) {
    if (!["cliente", "ristoratore"].includes(role)) {
      // Esegue: return res.status(400).json({ error: "role obbligatorio e deve essere 'cliente' o 'ristoratore'" });
      return res.status(400).json({ error: "role obbligatorio e deve essere 'cliente' o 'ristoratore'" });
    // Esegue: }
    }

    // Esegue: if(role=="cliente" && (!indirizzo || !metodo_pagamento)){
    if(role=="cliente" && (!indirizzo || !metodo_pagamento)){
      // Esegue: return res.status(400).json({ error: "Indirizzo e metodo di pagamento sono obbligatori" });
      return res.status(400).json({ error: "Indirizzo e metodo di pagamento sono obbligatori" });
    // Esegue: }
    }

    // Esegue: if (role === "cliente") {
    if (role === "cliente") {
      // Esegue: const addressValidation = await validateAddressWithOpenStreetMap(indirizzo);
      const addressValidation = await validateAddressWithOpenStreetMap(indirizzo);
      // Esegue: if (!addressValidation.valid) {
      if (!addressValidation.valid) {
        // Esegue: return res.status(400).json({
        return res.status(400).json({
          // Esegue: error: `Indirizzo cliente non valido. ${addressValidation.reason}`
          error: `Indirizzo cliente non valido. ${addressValidation.reason}`
        // Esegue: });
        });
      // Esegue: }
      }
    // Esegue: }
    }

    // Esegue: if(role=="ristoratore" && !piva){
    if(role=="ristoratore" && !piva){
      // Esegue: return res.status(400).json({ error: "Partita IVA obbligatoria" });
      return res.status(400).json({ error: "Partita IVA obbligatoria" });
    // Esegue: }
    }

    // Esegue: const userExists = await db.collection("users").findOne({
    const userExists = await db.collection("users").findOne({
      // Esegue: $or: [{ username }, { email }],
      $or: [{ username }, { email }],
    // Esegue: });
    });

    // Esegue: if (userExists) {
    if (userExists) {
      // Esegue: return res.status(409).json({ error: "Username o email già in uso" });
      return res.status(409).json({ error: "Username o email già in uso" });
    // Esegue: }
    }

    // Hash password
    // Esegue: const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword = await bcrypt.hash(password, 10);

    const preferenzeSanificate = sanitizePreferenze(preferenze);

    // Esegue: let newUser={};
    let newUser={};

    // Esegue: if(role=="ristoratore"){
    if(role=="ristoratore"){
      // Esegue: newUser = {
      newUser = {
        // Esegue: username,
        username,
        // Esegue: email,
        email,
        // Esegue: password: hashedPassword,
        password: hashedPassword,
        // Esegue: numero_di_telefono,
        numero_di_telefono,
        // Esegue: piva: piva,
        piva: piva,
        // Esegue: role
        role
      // Esegue: };
      };
    // Esegue: }else{
    }else{
      // Esegue: newUser = {
      newUser = {
        // Esegue: username,
        username,
        // Esegue: email,
        email,
        // Esegue: password: hashedPassword,
        password: hashedPassword,
        // Esegue: numero_di_telefono,
        numero_di_telefono,
        // Esegue: indirizzo,
        indirizzo,
        // Esegue: metodo_pagamento,
        metodo_pagamento,
        // Esegue: preferenze: Array.isArray(preferenze) ? preferenze : [],
        preferenze: preferenzeSanificate,
        // Esegue: role,
        role,
      // Esegue: };
      };
    // Esegue: }
    }

    // Esegue: const result = await db.collection("users").insertOne(newUser);
    const result = await db.collection("users").insertOne(newUser);
    // Esegue: res.status(201).json({ message: "Utente registrato con successo", userId: result.insertedId });
    res.status(201).json({ message: "Utente registrato con successo", userId: result.insertedId });

  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nella registrazione" });
    res.status(500).json({ error: "Errore nella registrazione" });
  // Esegue: }
  }
// Esegue: });
});

// POST /users/login - login
// Esegue: usersRouter.post("/login", async (req, res) => {
usersRouter.post("/login", async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const { username, password } = req.body;
    const { username, password } = req.body;

    // Esegue: if (!username || !password) {
    if (!username || !password) {
      // Esegue: return res.status(400).json({ error: "username e password sono obbligatori" });
      return res.status(400).json({ error: "username e password sono obbligatori" });
    // Esegue: }
    }

    // Esegue: const user = await db.collection("users").findOne({ username });
    const user = await db.collection("users").findOne({ username });
    // Esegue: if (!user) {
    if (!user) {
      // Esegue: return res.status(401).json({ error: "Credenziali non valide" });
      return res.status(401).json({ error: "Credenziali non valide" });
    // Esegue: }
    }

    // Esegue: const passwordMatch = await bcrypt.compare(password, user.password);
    const passwordMatch = await bcrypt.compare(password, user.password);
    // Esegue: if (!passwordMatch) {
    if (!passwordMatch) {
      // Esegue: return res.status(401).json({ error: "Credenziali non valide" });
      return res.status(401).json({ error: "Credenziali non valide" });
    // Esegue: }
    }

    // genera JWT con userId e role, codificato in base alla chiave memorizzata nel file .env
    // Esegue: const token = jwt.sign(
    const token = jwt.sign(
      // Esegue: { userId: user._id.toString(), role: user.role },
      { userId: user._id.toString(), role: user.role },
      // Esegue: process.env.JWT_SECRET,
      process.env.JWT_SECRET,
      // Esegue: { expiresIn: process.env.JWT_EXPIRES_IN }
      { expiresIn: process.env.JWT_EXPIRES_IN }
    // Esegue: );
    );

    // Esegue: res.json({ token });
    res.json({ token });
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nel login" });
    res.status(500).json({ error: "Errore nel login" });
  // Esegue: }
  }
// Esegue: });
});

// GET /users/me - Restituisce informazioni relative all'utente autenticato
// Esegue: usersRouter.get("/me", authenticateUser, async (req, res) => {
usersRouter.get("/me", authenticateUser, async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const userId = req.user._id;
    const userId = req.user._id;

    // Esegue: const user = await db.collection("users").findOne(
    const user = await db.collection("users").findOne(
      // Esegue: { _id: new ObjectId(userId) },
      { _id: new ObjectId(userId) },
      // Esegue: { projection: { password: 0 } }
      { projection: { password: 0 } }
    // Esegue: );
    );

    // Esegue: if (!user) return res.status(404).json({ error: "Utente non trovato" });
    if (!user) return res.status(404).json({ error: "Utente non trovato" });

    // Esegue: res.json(user);
    res.json(user);
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nel recupero utente" });
    res.status(500).json({ error: "Errore nel recupero utente" });
  // Esegue: }
  }
// Esegue: });
});

// PUT /users/me - Modifica dati profilo utente autenticato (passsword esclusa)
// Esegue: usersRouter.put("/me", authenticateUser, async (req, res) => {
usersRouter.put("/me", authenticateUser, async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const userId = req.user._id;
    const userId = req.user._id;
    // Esegue: const role = req.user.role;
    const role = req.user.role;
    // Esegue: const {
    const {
      // Esegue: username,
      username,
      // Esegue: email,
      email,
      // Esegue: numero_di_telefono,
      numero_di_telefono,
      // Esegue: indirizzo = "",
      indirizzo = "",
      // Esegue: metodo_pagamento = "",
      metodo_pagamento = "",
      // Esegue: piva = ""
      piva = ""
    // Esegue: } = req.body;
    } = req.body;

    // Esegue: if (!username || !email || !numero_di_telefono) {
    if (!username || !email || !numero_di_telefono) {
      // Esegue: return res.status(400).json({ error: "username, email e numero di telefono sono obbligatori" });
      return res.status(400).json({ error: "username, email e numero di telefono sono obbligatori" });
    // Esegue: }
    }

    // Esegue: if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      // Esegue: return res.status(400).json({ error: "Username non valido: usa 3-20 caratteri tra lettere, numeri...
      return res.status(400).json({ error: "Username non valido: usa 3-20 caratteri tra lettere, numeri e underscore (_)" });
    // Esegue: }
    }

    // Esegue: if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      // Esegue: return res.status(400).json({ error: "Email non valida" });
      return res.status(400).json({ error: "Email non valida" });
    // Esegue: }
    }

    // Esegue: if (!/^\+?[0-9][0-9\s-]{7,16}$/.test(numero_di_telefono)) {
    if (!/^\+?[0-9][0-9\s-]{7,16}$/.test(numero_di_telefono)) {
      // Esegue: return res.status(400).json({ error: "Numero di telefono non valido" });
      return res.status(400).json({ error: "Numero di telefono non valido" });
    // Esegue: }
    }

    // Esegue: if (role === "cliente" && (!indirizzo || !metodo_pagamento)) {
    if (role === "cliente" && (!indirizzo || !metodo_pagamento)) {
      // Esegue: return res.status(400).json({ error: "Indirizzo e metodo di pagamento sono obbligatori" });
      return res.status(400).json({ error: "Indirizzo e metodo di pagamento sono obbligatori" });
    // Esegue: }
    }

    // Esegue: if (role === "cliente") {
    if (role === "cliente") {
      // Esegue: const addressValidation = await validateAddressWithOpenStreetMap(indirizzo);
      const addressValidation = await validateAddressWithOpenStreetMap(indirizzo);
      // Esegue: if (!addressValidation.valid) {
      if (!addressValidation.valid) {
        // Esegue: return res.status(400).json({
        return res.status(400).json({
          // Esegue: error: `Indirizzo cliente non valido. ${addressValidation.reason}`
          error: `Indirizzo cliente non valido. ${addressValidation.reason}`
        // Esegue: });
        });
      // Esegue: }
      }
    // Esegue: }
    }

    // Esegue: if (role === "ristoratore" && !piva) {
    if (role === "ristoratore" && !piva) {
      // Esegue: return res.status(400).json({ error: "Partita IVA obbligatoria" });
      return res.status(400).json({ error: "Partita IVA obbligatoria" });
    // Esegue: }
    }

    // Esegue: if (role === "ristoratore" && !/^\d{11}$/.test(piva)) {
    if (role === "ristoratore" && !/^\d{11}$/.test(piva)) {
      // Esegue: return res.status(400).json({ error: "Partita IVA non valida: deve contenere 11 cifre" });
      return res.status(400).json({ error: "Partita IVA non valida: deve contenere 11 cifre" });
    // Esegue: }
    }

    // impedisce inserimento nuova mail o username, se non è univoco per il db.
    // Esegue: if (req.body.email || req.body.username) {
    if (req.body.email || req.body.username) {
      // Esegue: const query = {
      const query = {
        // Esegue: $or: [],
        $or: [],
        // Esegue: _id: { $ne: new ObjectId(userId) },
        _id: { $ne: new ObjectId(userId) },
      // Esegue: };
      };
      // Esegue: if (req.body.email) query.$or.push({ email: req.body.email });
      if (req.body.email) query.$or.push({ email: req.body.email });
      // Esegue: if (req.body.username) query.$or.push({ username: req.body.username });
      if (req.body.username) query.$or.push({ username: req.body.username });

      // Esegue: if (query.$or.length > 0) {
      if (query.$or.length > 0) {
        // Esegue: const exists = await db.collection("users").findOne(query);
        const exists = await db.collection("users").findOne(query);
        // Esegue: if (exists) {
        if (exists) {
          // Esegue: return res.status(409).json({ error: "Username o email già in uso" });
          return res.status(409).json({ error: "Username o email già in uso" });
        // Esegue: }
        }
      // Esegue: }
      }
    // Esegue: }
    }
    // Esegue: const updatedUser = await db.collection("users").findOneAndUpdate(
    const updatedUser = await db.collection("users").findOneAndUpdate(
      // Esegue: { _id: new ObjectId(userId) },
      { _id: new ObjectId(userId) },
      // Esegue: { $set: req.body },
      { $set: req.body },
      // Esegue: { returnDocument: "after", projection: { password: 0 } }
      { returnDocument: "after", projection: { password: 0 } }
    // Esegue: );
    );

    // Esegue: if (!updatedUser) return res.status(404).json({ error: "Utente non trovato" });
    if (!updatedUser) return res.status(404).json({ error: "Utente non trovato" });

    // Esegue: res.json(updatedUser);
    res.json(updatedUser);
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nell'aggiornamento utente" });
    res.status(500).json({ error: "Errore nell'aggiornamento utente" });
  // Esegue: }
  }
// Esegue: });
});

// PUT /users/me/password - Modifica password utente autenticato
// Esegue: usersRouter.put("/me/password", authenticateUser, async (req, res) => {
usersRouter.put("/me/password", authenticateUser, async (req, res) => {
  // Esegue: try {
  try {
    // Esegue: const db = req.app.locals.db;
    const db = req.app.locals.db;
    // Esegue: const userId = req.user._id;
    const userId = req.user._id;
    // Esegue: const { oldPassword, newPassword } = req.body;
    const { oldPassword, newPassword } = req.body;
    
    // Esegue: const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    // Esegue: if (!user) return res.status(404).json({ error: "Utente non trovato" });
    if (!user) return res.status(404).json({ error: "Utente non trovato" });

    // Esegue: if (!oldPassword || !newPassword) {
    if (!oldPassword || !newPassword) {
      // Esegue: return res.status(400).json({ error: "Errore durante l'analisi dei parametri" });
      return res.status(400).json({ error: "Errore durante l'analisi dei parametri" });
    // Esegue: }
    }
    
    // Esegue: if (newPassword === oldPassword) {
    if (newPassword === oldPassword) {
      // Esegue: return res.status(400).json({ error: "La nuova password deve essere diversa dalla vecchia passwor...
      return res.status(400).json({ error: "La nuova password deve essere diversa dalla vecchia password" });
    // Esegue: }
    }

    // Esegue: if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(newPassword)) {
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(newPassword)) {
      // Esegue: return res.status(400).json({ error: "Nuova password non valida: minimo 8 caratteri, almeno una l...
      return res.status(400).json({ error: "Nuova password non valida: minimo 8 caratteri, almeno una lettera, un numero e un simbolo" });
    // Esegue: }
    }

    // Esegue: const passwordMatch = await bcrypt.compare(oldPassword,user.password);
    const passwordMatch = await bcrypt.compare(oldPassword,user.password);
    // Esegue: if(!passwordMatch){
    if(!passwordMatch){
      // Esegue: return res.status(400).json({ error: "La Vecchia password non corrisponde col valore indicato." });
      return res.status(400).json({ error: "La Vecchia password non corrisponde col valore indicato." });

    // Esegue: }
    }

    // Esegue: const hashedNewPassword = await bcrypt.hash(newPassword,10);
    const hashedNewPassword = await bcrypt.hash(newPassword,10);
    // Esegue: await db.collection("users").updateOne(
    await db.collection("users").updateOne(
      // Esegue: { _id: new ObjectId(userId) },
      { _id: new ObjectId(userId) },
      // Esegue: { $set: { password: hashedNewPassword} }
      { $set: { password: hashedNewPassword} }
    // Esegue: );
    );

    // Esegue: res.json({ message: "Password aggiornata con successo" });
    res.json({ message: "Password aggiornata con successo" });
  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore nell'aggiornamento password" });
    res.status(500).json({ error: "Errore nell'aggiornamento password" });
  // Esegue: }
  }
// Esegue: });
});

//DELETE /:id - Elimina utente autenticato:
//Se l'utente è un cliente, vengono eliminati anche il carrello e tutti gli ordini ancora attivi (quelli già consegnati, rimangono nel DB per statistiche ristorante)
//Se l'utente è un ristoratore, vengono eliminati anche il suo ristorante, e tutti gli ordini di quel ristorante.
// Esegue: usersRouter.delete("/:id", authenticateUser, async (req, res) => {
usersRouter.delete("/:id", authenticateUser, async (req, res) => {
  // Esegue: const db = req.app.locals.db;
  const db = req.app.locals.db;
  // Esegue: const userId = req.params.id;
  const userId = req.params.id;

  // Esegue: if (!ObjectId.isValid(userId)) {
  if (!ObjectId.isValid(userId)) {
    // Esegue: return res.status(400).json({ error: "ID utente non valido" });
    return res.status(400).json({ error: "ID utente non valido" });
  // Esegue: }
  }

  // Esegue: if (req.user._id.toString() !== userId.toString()) {
  if (req.user._id.toString() !== userId.toString()) {
    // Esegue: return res.status(403).json({ error: "Non puoi eliminare un altro utente" });
    return res.status(403).json({ error: "Non puoi eliminare un altro utente" });
  // Esegue: }
  }

  // Esegue: try {
  try {
    // Esegue: if (req.user.role === "cliente") {
    if (req.user.role === "cliente") {
      // Esegue: await db.collection("carts").deleteOne({ user_id: new ObjectId(userId) });
      await db.collection("carts").deleteOne({ user_id: new ObjectId(userId) });
      // Esegue: await db.collection("orders").deleteMany({
      await db.collection("orders").deleteMany({
        // Esegue: cliente_id: new ObjectId(userId),
        cliente_id: new ObjectId(userId),
        // Esegue: stato: { $ne: "consegnato" }
        stato: { $ne: "consegnato" }
      // Esegue: });
      });
          // Esegue: }
          }

    // Esegue: if (req.user.role === "ristoratore") {
    if (req.user.role === "ristoratore") {
      // Esegue: const restaurant = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(user...
      const restaurant = await db.collection("restaurants").findOne({ ristoratore_id: new ObjectId(userId) });
      // Esegue: if (restaurant) {
      if (restaurant) {
        // Esegue: await db.collection("orders").deleteMany({ ristorante_id: new ObjectId(restaurant._id) });
        await db.collection("orders").deleteMany({ ristorante_id: new ObjectId(restaurant._id) });
        // Esegue: await db.collection("restaurants").deleteOne({ _id: new ObjectId(restaurant._id) });
        await db.collection("restaurants").deleteOne({ _id: new ObjectId(restaurant._id) });
      // Esegue: }
      }
    // Esegue: }
    }

    // Esegue: await db.collection("users").deleteOne({ _id: new ObjectId(userId) });
    await db.collection("users").deleteOne({ _id: new ObjectId(userId) });

    // Esegue: res.json({ message: "Utente eliminato correttamente e dati associati rimossi." });
    res.json({ message: "Utente eliminato correttamente e dati associati rimossi." });

  // Esegue: } catch (err) {
  } catch (err) {
    // Esegue: console.error(err);
    console.error(err);
    // Esegue: res.status(500).json({ error: "Errore durante l'eliminazione dell'utente" });
    res.status(500).json({ error: "Errore durante l'eliminazione dell'utente" });
  // Esegue: }
  }
// Esegue: });
});
// Esegue: export default usersRouter;
export default usersRouter;
