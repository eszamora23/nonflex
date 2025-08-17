function requireRole(role) {
  return (req, res, next) => {
    const user = req.user;
    const roles = user && (user.roles || user.role);

    // roles may be array or single value
    const hasRole = Array.isArray(roles)
      ? roles.includes(role)
      : roles === role;

    if (!hasRole) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

export { requireRole };
