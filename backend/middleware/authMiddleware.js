const jwt = require("jsonwebtoken");
const supabase = require("../database/supabaseClient");

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Check for token in cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Get user from token
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", decoded.id)
        .single();
      if (userError && userError.code !== "PGRST116")
        return res
          .status(401)
          .json({ success: false, message: userError.message });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }
      if (user.status && user.status !== "active") {
        return res.status(401).json({
          success: false,
          message: "Your account is not active",
        });
      }
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if user is logged in
const authGuard = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.id)
      .single();
    if (userError && userError.code !== "PGRST116")
      return res
        .status(401)
        .json({ success: false, message: userError.message });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

// Admin guard middleware
const adminGuard = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(401).json({
      success: false,
      message: "Not authorized as an admin",
    });
  }
};

module.exports = { protect, authorize, authGuard, adminGuard };
