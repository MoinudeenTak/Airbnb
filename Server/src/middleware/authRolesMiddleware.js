export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !Array.isArray(req.user.roles)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const hasRole = req.user.roles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to perform this action",
      });
    }

    next();
  };
};