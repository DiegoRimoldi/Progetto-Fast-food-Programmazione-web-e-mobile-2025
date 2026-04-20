(function () {
  var AUTH_PAGES = ['/login.html', '/register.html', '/logout.html', '/index.html', '/'];

  function getCurrentPath() {
    return window.location.pathname || '/';
  }

  function isAuthPage(pathname) {
    return AUTH_PAGES.includes(pathname);
  }

  function saveLastVisitedPath(pathname) {
    try {
      if (!isAuthPage(pathname)) {
        sessionStorage.setItem('lastVisitedPath', pathname + window.location.search + window.location.hash);
      }
    } catch (error) {
      console.warn('Impossibile salvare il percorso corrente:', error);
    }
  }

  function restoreLastVisitedPath(payload) {
    var pathname = getCurrentPath();
    if (pathname !== '/login.html' || !payload) return;

    try {
      var fallbackPath = payload.role === 'ristoratore' ? '/ristoratore/home.html' : '/cliente/home.html';
      var targetPath = sessionStorage.getItem('lastVisitedPath') || fallbackPath;

      if (targetPath && !isAuthPage(targetPath)) {
        window.location.replace(targetPath);
      }
    } catch (error) {
      console.warn('Impossibile ripristinare l’ultima pagina visitata:', error);
    }
  }

  function decodeJwtPayload(token) {
    var parts = token.split('.');
    if (parts.length < 2) return null;

    var base64Url = parts[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

    try {
      return JSON.parse(atob(padded));
    } catch (error) {
      console.error('Token JWT non decodificabile:', error);
      return null;
    }
  }

  function showAuthIssue(message) {
    console.warn('Controllo autenticazione:', message);
    return false;
  }

  function validateSession() {
    var token = localStorage.getItem('token');
    if (!token) return null;

    var payload = decodeJwtPayload(token);
    if (!payload || !payload.role || !payload.userId) return null;

    localStorage.setItem('role', payload.role);
    localStorage.setItem('userId', payload.userId);

    saveLastVisitedPath(getCurrentPath());
    return payload;
  }

  (function bootstrapNavigationState() {
    var payload = validateSession();
    restoreLastVisitedPath(payload);
  })();

  window.handleAuthIssue = function (reason) {
    return showAuthIssue(reason || 'sessione non valida');
  };

  window.ensureAuthenticated = function () {
    var payload = validateSession();
    if (!payload) {
      return showAuthIssue('utente non autenticato');
    }
    return true;
  };

  window.ensureAuthenticatedRole = function (expectedRole) {
    var payload = validateSession();
    if (!payload) {
      return showAuthIssue('utente non autenticato');
    }

    // Evita redirect involontari su refresh: in caso di mismatch ruolo rimaniamo nella pagina.
    if (payload.role !== expectedRole) {
      return showAuthIssue('ruolo non autorizzato');
    }

    return true;
  };
})();
