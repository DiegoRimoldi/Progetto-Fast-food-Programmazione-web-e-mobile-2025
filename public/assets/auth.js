/**
 * Analisi file: auth.js.
 * Questo modulo gestisce una parte specifica dell'applicazione Fast Food.
 */
// Esegue: (function () {
(function () {
  // Esegue: var AUTH_PAGES = ['/login.html', '/register.html', '/logout.html', '/index.html', '/'];
  var AUTH_PAGES = ['/login.html', '/register.html', '/logout.html', '/index.html', '/'];
  // Esegue: var ROLE_PATH_PREFIXES = {
  var ROLE_PATH_PREFIXES = {
    // Esegue: ristoratore: '/ristoratore/',
    ristoratore: '/ristoratore/',
    // Esegue: cliente: '/cliente/'
    cliente: '/cliente/'
  // Esegue: };
  };

  // Esegue: function getCurrentPath() {
  function getCurrentPath() {
    // Esegue: return window.location.pathname || '/';
    return window.location.pathname || '/';
  // Esegue: }
  }

  // Esegue: function isAuthPage(pathname) {
  function isAuthPage(pathname) {
    // Esegue: return AUTH_PAGES.includes(pathname);
    return AUTH_PAGES.includes(pathname);
  // Esegue: }
  }

  // Esegue: function saveLastVisitedPath(pathname) {
  function saveLastVisitedPath(pathname) {
    // Esegue: try {
    try {
      // Esegue: if (!isAuthPage(pathname)) {
      if (!isAuthPage(pathname)) {
        // Esegue: sessionStorage.setItem('lastVisitedPath', pathname + window.location.search + window.location.hash);
        sessionStorage.setItem('lastVisitedPath', pathname + window.location.search + window.location.hash);
      // Esegue: }
      }
    // Esegue: } catch (error) {
    } catch (error) {
      // Esegue: console.warn('Impossibile salvare il percorso corrente:', error);
      console.warn('Impossibile salvare il percorso corrente:', error);
    // Esegue: }
    }
  // Esegue: }
  }

  // Esegue: function restoreLastVisitedPath(payload) {
  function restoreLastVisitedPath(payload) {
    // Esegue: var pathname = getCurrentPath();
    var pathname = getCurrentPath();
    // Esegue: if (pathname !== '/login.html' || !payload) return;
    if (pathname !== '/login.html' || !payload) return;

    // Esegue: try {
    try {
      // Esegue: var fallbackPath = payload.role === 'ristoratore' ? '/ristoratore/home.html' : '/cliente/home.html';
      var fallbackPath = payload.role === 'ristoratore' ? '/ristoratore/home.html' : '/cliente/home.html';
      // Esegue: var targetPath = sessionStorage.getItem('lastVisitedPath') || fallbackPath;
      var targetPath = sessionStorage.getItem('lastVisitedPath') || fallbackPath;

      // Esegue: if (targetPath && !isAuthPage(targetPath)) {
      if (targetPath && !isAuthPage(targetPath)) {
        // Esegue: window.location.replace(targetPath);
        window.location.replace(targetPath);
      // Esegue: }
      }
    // Esegue: } catch (error) {
    } catch (error) {
      // Esegue: console.warn('Impossibile ripristinare l’ultima pagina visitata:', error);
      console.warn('Impossibile ripristinare l’ultima pagina visitata:', error);
    // Esegue: }
    }
  // Esegue: }
  }

  // Esegue: function decodeJwtPayload(token) {
  function decodeJwtPayload(token) {
    // Esegue: var parts = token.split('.');
    var parts = token.split('.');
    // Esegue: if (parts.length < 2) return null;
    if (parts.length < 2) return null;

    // Esegue: var base64Url = parts[1];
    var base64Url = parts[1];
    // Esegue: var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Esegue: var padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    var padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

    // Esegue: try {
    try {
      // Esegue: return JSON.parse(atob(padded));
      return JSON.parse(atob(padded));
    // Esegue: } catch (error) {
    } catch (error) {
      // Esegue: console.error('Token JWT non decodificabile:', error);
      console.error('Token JWT non decodificabile:', error);
      // Esegue: return null;
      return null;
    // Esegue: }
    }
  // Esegue: }
  }

  // Esegue: function showAuthIssue(message) {
  function showAuthIssue(message) {
    // Esegue: console.warn('Controllo autenticazione:', message);
    console.warn('Controllo autenticazione:', message);
    // Esegue: return false;
    return false;
  // Esegue: }
  }

  // Esegue: function inferRoleFromPath(pathname) {
  function inferRoleFromPath(pathname) {
    // Esegue: if (!pathname) return null;
    if (!pathname) return null;
    // Esegue: if (pathname.indexOf(ROLE_PATH_PREFIXES.ristoratore) === 0) return 'ristoratore';
    if (pathname.indexOf(ROLE_PATH_PREFIXES.ristoratore) === 0) return 'ristoratore';
    // Esegue: if (pathname.indexOf(ROLE_PATH_PREFIXES.cliente) === 0) return 'cliente';
    if (pathname.indexOf(ROLE_PATH_PREFIXES.cliente) === 0) return 'cliente';
    // Esegue: return null;
    return null;
  // Esegue: }
  }

  // Esegue: function getRoleScopedValue(baseKey, role) {
  function getRoleScopedValue(baseKey, role) {
    // Esegue: if (!role) return null;
    if (!role) return null;
    // Esegue: return localStorage.getItem(baseKey + '_' + role);
    return localStorage.getItem(baseKey + '_' + role);
  // Esegue: }
  }

  // Esegue: function setRoleScopedValue(baseKey, role, value) {
  function setRoleScopedValue(baseKey, role, value) {
    // Esegue: if (!role || value === null || value === undefined || value === '') return;
    if (!role || value === null || value === undefined || value === '') return;
    // Esegue: localStorage.setItem(baseKey + '_' + role, value);
    localStorage.setItem(baseKey + '_' + role, value);
  // Esegue: }
  }

  // Esegue: function validateSession(expectedRole) {
  function validateSession(expectedRole) {
    // Esegue: var pathname = getCurrentPath();
    var pathname = getCurrentPath();
    // Esegue: var roleFromPath = inferRoleFromPath(pathname);
    var roleFromPath = inferRoleFromPath(pathname);
    // Esegue: var activeRole = expectedRole || roleFromPath;
    var activeRole = expectedRole || roleFromPath;

    // Esegue: var token = getRoleScopedValue('token', activeRole) || localStorage.getItem('token');
    var token = getRoleScopedValue('token', activeRole) || localStorage.getItem('token');
    // Esegue: if (!token) return null;
    if (!token) return null;

    // Esegue: var payload = decodeJwtPayload(token);
    var payload = decodeJwtPayload(token);
    // Esegue: if (!payload || !payload.role || !payload.userId) return null;
    if (!payload || !payload.role || !payload.userId) return null;

    // Esegue: if (activeRole && payload.role !== activeRole) {
    if (activeRole && payload.role !== activeRole) {
      // Esegue: var fallbackToken = localStorage.getItem('token');
      var fallbackToken = localStorage.getItem('token');
      // Esegue: var fallbackPayload = fallbackToken ? decodeJwtPayload(fallbackToken) : null;
      var fallbackPayload = fallbackToken ? decodeJwtPayload(fallbackToken) : null;
      // Esegue: if (!fallbackPayload || fallbackPayload.role !== activeRole || !fallbackPayload.userId) {
      if (!fallbackPayload || fallbackPayload.role !== activeRole || !fallbackPayload.userId) {
        // Esegue: return null;
        return null;
      // Esegue: }
      }
      // Esegue: token = fallbackToken;
      token = fallbackToken;
      // Esegue: payload = fallbackPayload;
      payload = fallbackPayload;
    // Esegue: }
    }

    // Esegue: localStorage.setItem('token', token);
    localStorage.setItem('token', token);
    // Esegue: localStorage.setItem('role', payload.role);
    localStorage.setItem('role', payload.role);
    // Esegue: localStorage.setItem('userId', payload.userId);
    localStorage.setItem('userId', payload.userId);
    // Esegue: setRoleScopedValue('token', payload.role, token);
    setRoleScopedValue('token', payload.role, token);
    // Esegue: setRoleScopedValue('userId', payload.role, payload.userId);
    setRoleScopedValue('userId', payload.role, payload.userId);

    // Esegue: saveLastVisitedPath(pathname);
    saveLastVisitedPath(pathname);
    // Esegue: return payload;
    return payload;
  // Esegue: }
  }

  // Esegue: (function bootstrapNavigationState() {
  (function bootstrapNavigationState() {
    // Esegue: var payload = validateSession();
    var payload = validateSession();
    // Esegue: restoreLastVisitedPath(payload);
    restoreLastVisitedPath(payload);
  // Esegue: })();
  })();

  // Esegue: window.handleAuthIssue = function (reason) {
  window.handleAuthIssue = function (reason) {
    // Esegue: return showAuthIssue(reason || 'sessione non valida');
    return showAuthIssue(reason || 'sessione non valida');
  // Esegue: };
  };

  // Esegue: window.ensureAuthenticated = function () {
  window.ensureAuthenticated = function () {
    // Esegue: var payload = validateSession();
    var payload = validateSession();
    // Esegue: if (!payload) {
    if (!payload) {
      // Esegue: return showAuthIssue('utente non autenticato');
      return showAuthIssue('utente non autenticato');
    // Esegue: }
    }
    // Esegue: return true;
    return true;
  // Esegue: };
  };

  // Esegue: window.ensureAuthenticatedRole = function (expectedRole) {
  window.ensureAuthenticatedRole = function (expectedRole) {
    // Esegue: var payload = validateSession(expectedRole);
    var payload = validateSession(expectedRole);
    // Esegue: if (!payload) {
    if (!payload) {
      // Esegue: return showAuthIssue('utente non autenticato');
      return showAuthIssue('utente non autenticato');
    // Esegue: }
    }

    // Evita redirect involontari su refresh: in caso di mismatch ruolo rimaniamo nella pagina.
    // Esegue: if (payload.role !== expectedRole) {
    if (payload.role !== expectedRole) {
      // Esegue: return showAuthIssue('ruolo non autorizzato');
      return showAuthIssue('ruolo non autorizzato');
    // Esegue: }
    }

    // Esegue: return true;
    return true;
  // Esegue: };
  };
// Esegue: })();
})();
