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

  function isReloadNavigation() {
    var navEntries = performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0) {
      return navEntries[0].type === 'reload';
    }

    if (performance.navigation) {
      return performance.navigation.type === 1;
    }

    return false;
  }

  function redirectToLogin() {
    window.location.href = '/login.html';
  }

  window.redirectToLoginIfAllowed = function () {
    if (isReloadNavigation()) {
      console.warn('Redirect al login bloccato perché la pagina è stata ricaricata.');
      return false;
    }

    redirectToLogin();
    return true;
  };

  window.redirectToLogoutIfAllowed = function () {
    if (isReloadNavigation()) {
      console.warn('Redirect al logout bloccato perché la pagina è stata ricaricata.');
      return false;
    }

    window.location.href = '/logout.html';
    return true;
  };

  function validateSession() {
    var token = localStorage.getItem('token');
    if (!token) return null;

    var payload = decodeJwtPayload(token);
    if (!payload || !payload.role || !payload.userId) return null;

    localStorage.setItem('role', payload.role);
    localStorage.setItem('userId', payload.userId);
    return payload;
  }

  window.ensureAuthenticated = function () {
    var payload = validateSession();
    if (!payload) {
      localStorage.clear();
      window.redirectToLoginIfAllowed();
      return false;
    }
    return true;
  };

  window.ensureAuthenticatedRole = function (expectedRole) {
    var payload = validateSession();
    if (!payload) {
      localStorage.clear();
      window.redirectToLoginIfAllowed();
      return false;
    }

    // Evita redirect involontari su refresh in caso di clock del client non allineato.
    // La validità reale del token viene sempre verificata dal backend sulle API protette.
    if (payload.role !== expectedRole) {
      window.redirectToLoginIfAllowed();
      return false;
    }

    return true;
  };
})();
