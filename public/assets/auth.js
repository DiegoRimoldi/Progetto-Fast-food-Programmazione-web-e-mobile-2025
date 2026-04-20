(function () {
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
    return payload;
  }

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
