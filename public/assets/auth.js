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

  function redirectToLogin() {
    window.location.href = '../login.html';
  }

  window.ensureAuthenticatedRole = function (expectedRole) {
    var token = localStorage.getItem('token');
    if (!token) {
      redirectToLogin();
      return false;
    }

    var payload = decodeJwtPayload(token);
    if (!payload || !payload.role || !payload.userId) {
      localStorage.clear();
      redirectToLogin();
      return false;
    }

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      localStorage.clear();
      redirectToLogin();
      return false;
    }

    localStorage.setItem('role', payload.role);
    localStorage.setItem('userId', payload.userId);

    if (payload.role !== expectedRole) {
      redirectToLogin();
      return false;
    }

    return true;
  };
})();
