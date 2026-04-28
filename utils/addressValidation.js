/**
 * Analisi file: addressValidation.js.
 * Questo modulo gestisce una parte specifica dell'applicazione Fast Food.
 */
// Esegue: const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
// Esegue: const NOMINATIM_TIMEOUT_MS = 7000;
const NOMINATIM_TIMEOUT_MS = 7000;
// Esegue: const USER_AGENT = "FastFoodProject/1.0 (A.A.2025-2026)";
const USER_AGENT = "FastFoodProject/1.0 (A.A.2025-2026)";

// Esegue: function normalizeValue(value = "") {
function normalizeValue(value = "") {
  // Esegue: return value
  return value
    // Esegue: .toString()
    .toString()
    // Esegue: .trim()
    .trim()
    // Esegue: .toLowerCase()
    .toLowerCase()
    // Esegue: .normalize("NFD")
    .normalize("NFD")
    // Esegue: .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0300-\u036f]/g, "")
    // Esegue: .replace(/\s+/g, " ");
    .replace(/\s+/g, " ");
// Esegue: }
}

// Esegue: function extractAddressParts(rawAddress = "") {
function extractAddressParts(rawAddress = "") {
  // Esegue: const address = rawAddress.trim().replace(/\s+/g, " ");
  const address = rawAddress.trim().replace(/\s+/g, " ");
  // Esegue: const chunks = address.split(",").map((part) => part.trim()).filter(Boolean);
  const chunks = address.split(",").map((part) => part.trim()).filter(Boolean);

  // Esegue: const capMatch = address.match(/\b\d{5}\b/);
  const capMatch = address.match(/\b\d{5}\b/);
  // Esegue: const cap = capMatch ? capMatch[0] : "";
  const cap = capMatch ? capMatch[0] : "";

  // Esegue: const streetChunk = chunks[0] || "";
  const streetChunk = chunks[0] || "";

  // versione migliorata: pulisce CAP e "Italia"
  // Esegue: const cityChunkRaw = chunks.length > 1 ? chunks[chunks.length - 1] : "";
  const cityChunkRaw = chunks.length > 1 ? chunks[chunks.length - 1] : "";
  // Esegue: const cityChunk = cityChunkRaw
  const cityChunk = cityChunkRaw
    // Esegue: .replace(/\b\d{5}\b/, "")
    .replace(/\b\d{5}\b/, "")
    // Esegue: .replace(/\b(italia|italy)\b/i, "")
    .replace(/\b(italia|italy)\b/i, "")
    // Esegue: .trim();
    .trim();

  // Esegue: const hasStreetNumber = /\b\d+[a-zA-Z]?\b/.test(streetChunk);
  const hasStreetNumber = /\b\d+[a-zA-Z]?\b/.test(streetChunk);

  // Esegue: return {
  return {
    // Esegue: address,
    address,
    // Esegue: chunks,
    chunks,
    // Esegue: cap,
    cap,
    // Esegue: streetChunk,
    streetChunk,
    // Esegue: cityChunk,
    cityChunk,
    // Esegue: hasStreetNumber
    hasStreetNumber
  // Esegue: };
  };
// Esegue: }
}

// Esegue: function addressMatches(parsedInput, nominatimAddress = {}) {
function addressMatches(parsedInput, nominatimAddress = {}) {
  // Esegue: const roadCandidates = [
  const roadCandidates = [
    // Esegue: nominatimAddress.road,
    nominatimAddress.road,
    // Esegue: nominatimAddress.pedestrian,
    nominatimAddress.pedestrian,
    // Esegue: nominatimAddress.footway,
    nominatimAddress.footway,
    // Esegue: nominatimAddress.cycleway,
    nominatimAddress.cycleway,
    // Esegue: nominatimAddress.path,
    nominatimAddress.path,
    // Esegue: nominatimAddress.residential
    nominatimAddress.residential
  // Esegue: ].filter(Boolean);
  ].filter(Boolean);

  // versione migliorata: normalizza tipi di strada
  // Esegue: const normalizeStreet = (streetValue = "") => normalizeValue(
  const normalizeStreet = (streetValue = "") => normalizeValue(
    // Esegue: streetValue
    streetValue
      // Esegue: .replace(/\b(via|viale|piazza|corso|largo|vicolo|strada|piazzale)\b/gi, "")
      .replace(/\b(via|viale|piazza|corso|largo|vicolo|strada|piazzale)\b/gi, "")
      // Esegue: .replace(/[.,]/g, " ")
      .replace(/[.,]/g, " ")
  // Esegue: );
  );

  // Esegue: const inputStreet = normalizeStreet(parsedInput.streetChunk);
  const inputStreet = normalizeStreet(parsedInput.streetChunk);
  // Esegue: const inputCap = normalizeValue(parsedInput.cap);
  const inputCap = normalizeValue(parsedInput.cap);
  // Esegue: const inputCity = normalizeValue(parsedInput.cityChunk);
  const inputCity = normalizeValue(parsedInput.cityChunk);

  // Esegue: const candidateStreet = normalizeStreet(
  const candidateStreet = normalizeStreet(
    // Esegue: roadCandidates
    roadCandidates
      // Esegue: .map((road) => `${road} ${(nominatimAddress.house_number || "").trim()}`.trim())
      .map((road) => `${road} ${(nominatimAddress.house_number || "").trim()}`.trim())
      // Esegue: .join(" ")
      .join(" ")
  // Esegue: );
  );

  // Esegue: const candidateCity = normalizeValue([
  const candidateCity = normalizeValue([
    // Esegue: nominatimAddress.city,
    nominatimAddress.city,
    // Esegue: nominatimAddress.town,
    nominatimAddress.town,
    // Esegue: nominatimAddress.village,
    nominatimAddress.village,
    // Esegue: nominatimAddress.municipality,
    nominatimAddress.municipality,
    // Esegue: nominatimAddress.county
    nominatimAddress.county
  // Esegue: ].filter(Boolean).join(" "));
  ].filter(Boolean).join(" "));

  // Esegue: const candidateCap = normalizeValue(nominatimAddress.postcode || "");
  const candidateCap = normalizeValue(nominatimAddress.postcode || "");

  // Esegue: const streetMatches = inputStreet && candidateStreet && (
  const streetMatches = inputStreet && candidateStreet && (
    // Esegue: candidateStreet.includes(inputStreet) || inputStreet.includes(candidateStreet)
    candidateStreet.includes(inputStreet) || inputStreet.includes(candidateStreet)
  // Esegue: );
  );

  // Esegue: const cityMatches = inputCity && candidateCity && (
  const cityMatches = inputCity && candidateCity && (
    // Esegue: candidateCity.includes(inputCity) || inputCity.includes(candidateCity)
    candidateCity.includes(inputCity) || inputCity.includes(candidateCity)
  // Esegue: );
  );

  // Esegue: const capMatches = inputCap && candidateCap && inputCap === candidateCap;
  const capMatches = inputCap && candidateCap && inputCap === candidateCap;

  // Esegue: return streetMatches && cityMatches && capMatches;
  return streetMatches && cityMatches && capMatches;
// Esegue: }
}

// Esegue: export async function validateAddressWithOpenStreetMap(rawAddress, options = {}) {
export async function validateAddressWithOpenStreetMap(rawAddress, options = {}) {
  // Esegue: const { expectedCountryCode = "it" } = options;
  const { expectedCountryCode = "it" } = options;
  // Esegue: const parsedInput = extractAddressParts(rawAddress);
  const parsedInput = extractAddressParts(rawAddress);

  // Esegue: if (!parsedInput.address) {
  if (!parsedInput.address) {
    // Esegue: return { valid: false, reason: "Indirizzo mancante." };
    return { valid: false, reason: "Indirizzo mancante." };
  // Esegue: }
  }

  // Esegue: if (parsedInput.address.length < 12) {
  if (parsedInput.address.length < 12) {
    // Esegue: return { valid: false, reason: "Indirizzo troppo corto: specifica via, numero civico, CAP e città...
    return { valid: false, reason: "Indirizzo troppo corto: specifica via, numero civico, CAP e città." };
  // Esegue: }
  }

  // versione più permissiva ma corretta
  // Esegue: if (parsedInput.chunks.length < 2 && !parsedInput.cap) {
  if (parsedInput.chunks.length < 2 && !parsedInput.cap) {
    // Esegue: return { valid: false, reason: "Formato indirizzo non valido: usa almeno 'Via ... numero, CAP Cit...
    return { valid: false, reason: "Formato indirizzo non valido: usa almeno 'Via ... numero, CAP Città'." };
  // Esegue: }
  }

  // Esegue: if (!parsedInput.hasStreetNumber) {
  if (!parsedInput.hasStreetNumber) {
    // Esegue: return { valid: false, reason: "Inserisci un numero civico valido nell'indirizzo." };
    return { valid: false, reason: "Inserisci un numero civico valido nell'indirizzo." };
  // Esegue: }
  }

  // Esegue: if (!parsedInput.cap) {
  if (!parsedInput.cap) {
    // Esegue: return { valid: false, reason: "Inserisci un CAP valido a 5 cifre nell'indirizzo." };
    return { valid: false, reason: "Inserisci un CAP valido a 5 cifre nell'indirizzo." };
  // Esegue: }
  }

  // Esegue: if (!parsedInput.cityChunk) {
  if (!parsedInput.cityChunk) {
    // Esegue: return { valid: false, reason: "Inserisci anche la città insieme al CAP (es. 20121 Milano)." };
    return { valid: false, reason: "Inserisci anche la città insieme al CAP (es. 20121 Milano)." };
  // Esegue: }
  }

  // Esegue: const url = new URL(NOMINATIM_BASE_URL);
  const url = new URL(NOMINATIM_BASE_URL);
  // Esegue: url.searchParams.set("q", parsedInput.address);
  url.searchParams.set("q", parsedInput.address);
  // Esegue: url.searchParams.set("format", "jsonv2");
  url.searchParams.set("format", "jsonv2");
  // Esegue: url.searchParams.set("addressdetails", "1");
  url.searchParams.set("addressdetails", "1");
  // Esegue: url.searchParams.set("limit", "5");
  url.searchParams.set("limit", "5");
  // Esegue: url.searchParams.set("countrycodes", expectedCountryCode.toLowerCase());
  url.searchParams.set("countrycodes", expectedCountryCode.toLowerCase());

  // Esegue: const controller = new AbortController();
  const controller = new AbortController();
  // Esegue: const timeout = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT_MS);
  const timeout = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT_MS);

  // Esegue: try {
  try {
    // Esegue: const response = await fetch(url, {
    const response = await fetch(url, {
      // Esegue: headers: {
      headers: {
        // Esegue: "User-Agent": USER_AGENT,
        "User-Agent": USER_AGENT,
        // Esegue: "Accept": "application/json"
        "Accept": "application/json"
      // Esegue: },
      },
      // Esegue: signal: controller.signal
      signal: controller.signal
    // Esegue: });
    });

    // Esegue: if (!response.ok) {
    if (!response.ok) {
      // Esegue: throw new Error(`OpenStreetMap/Nominatim non disponibile (${response.status}).`);
      throw new Error(`OpenStreetMap/Nominatim non disponibile (${response.status}).`);
    // Esegue: }
    }

    // Esegue: const results = await response.json();
    const results = await response.json();
    // Esegue: if (!Array.isArray(results) || results.length === 0) {
    if (!Array.isArray(results) || results.length === 0) {
      // Esegue: return { valid: false, reason: "Indirizzo non trovato su OpenStreetMap/Nominatim." };
      return { valid: false, reason: "Indirizzo non trovato su OpenStreetMap/Nominatim." };
    // Esegue: }
    }

    // Esegue: const suitableResult = results.find((result) => {
    const suitableResult = results.find((result) => {
      // Esegue: const countryCode = normalizeValue(result?.address?.country_code || "");
      const countryCode = normalizeValue(result?.address?.country_code || "");
      // Esegue: if (countryCode !== expectedCountryCode.toLowerCase()) return false;
      if (countryCode !== expectedCountryCode.toLowerCase()) return false;
      // Esegue: return addressMatches(parsedInput, result.address || {});
      return addressMatches(parsedInput, result.address || {});
    // Esegue: });
    });

    // Esegue: if (!suitableResult) {
    if (!suitableResult) {
      // Esegue: return {
      return {
        // Esegue: valid: false,
        valid: false,
        // Esegue: reason: "L'indirizzo esiste ma non coincide con via, numero civico, CAP e città indicati."
        reason: "L'indirizzo esiste ma non coincide con via, numero civico, CAP e città indicati."
      // Esegue: };
      };
    // Esegue: }
    }

    // Esegue: return {
    return {
      // Esegue: valid: true,
      valid: true,
      // Esegue: normalizedAddress: suitableResult.display_name,
      normalizedAddress: suitableResult.display_name,
      // Esegue: coordinates: {
      coordinates: {
        // Esegue: lat: parseFloat(suitableResult.lat),
        lat: parseFloat(suitableResult.lat),
        // Esegue: lon: parseFloat(suitableResult.lon)
        lon: parseFloat(suitableResult.lon)
      // Esegue: }
      }
    // Esegue: };
    };
  // Esegue: } catch (error) {
  } catch (error) {
    // Esegue: return { valid: false, reason: `Errore durante la verifica dell'indirizzo: ${error.message}` };
    return { valid: false, reason: `Errore durante la verifica dell'indirizzo: ${error.message}` };
  // Esegue: } finally {
  } finally {
    // Esegue: clearTimeout(timeout);
    clearTimeout(timeout);
  // Esegue: }
  }
// Esegue: }
}
