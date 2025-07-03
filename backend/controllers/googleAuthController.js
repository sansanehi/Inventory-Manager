const jwt = require("jsonwebtoken");
const supabase = require("../database/supabaseClient");

// Generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Google Sign In
const googleSignIn = async (req, res) => {
  try {
    console.log("Google sign-in attempt started");
    const { id, email, name, picture } = req.body;

    // Validate required fields
    if (!email || !name || !id) {
      console.error("Missing required fields:", { email, name, id });
      return res.status(400).json({
        success: false,
        message: "Missing required user information",
      });
    }

    // First, try to find user by email
    let { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    console.log("User lookup result:", user ? "User found" : "User not found");

    if (user) {
      // User exists, update their Google information
      try {
        const { error: updateError } = await supabase
          .from("users")
          .update({
            googleId: id,
            authProvider: "google",
            photo: picture,
            isVerified: true,
          })
          .eq("id", user.id);
        if (updateError) console.error("Error updating user:", updateError);
        // Continue with sign in even if update fails
      } catch (updateError) {
        console.error("Error updating user:", updateError);
        // Continue with sign in even if update fails
      }
    } else {
      // Create new user
      try {
        console.log("Attempting to create new user with data:", {
          name,
          email,
          googleId: id,
          photo: picture,
          authProvider: "google",
        });
        // Create user object
        const newUser = {
          name,
          email,
          googleId: id,
          photo: picture,
          authProvider: "google",
          isVerified: true,
        };
        // Create the user
        const { data: createdUser, error: createError } = await supabase
          .from("users")
          .insert([newUser])
          .single();
        if (createError) {
          if (createError.code === "23505") {
            // Duplicate key error
            // Try to find the user again
            const { data: foundUser } = await supabase
              .from("users")
              .select("*")
              .eq("email", email)
              .single();
            user = foundUser;
            if (user) {
              // Update user with Google info
              await supabase
                .from("users")
                .update({
                  googleId: id,
                  authProvider: "google",
                  photo: picture,
                  isVerified: true,
                })
                .eq("id", user.id);
            } else {
              return res.status(500).json({
                success: false,
                message: "Error creating user account - duplicate email",
              });
            }
          } else {
            return res.status(500).json({
              success: false,
              message: "Error creating user account",
              error:
                process.env.NODE_ENV === "development"
                  ? createError.message
                  : undefined,
            });
          }
        } else {
          user = createdUser;
        }
      } catch (createError) {
        console.error("Error creating user:", createError);
        return res.status(500).json({
          success: false,
          message: "Error creating user account",
          error:
            process.env.NODE_ENV === "development"
              ? createError.message
              : undefined,
        });
      }
    }

    // Generate token
    let token;
    try {
      token = generateToken(user.id);
      console.log("Token generated successfully");
    } catch (tokenError) {
      console.error("Error generating token:", tokenError);
      return res.status(500).json({
        success: false,
        message: "Error generating authentication token",
      });
    }

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: "lax",
    });
    console.log("Cookie set successfully");

    // Send response
    const response = {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role,
      },
    };
    console.log("Sending successful response");
    res.status(200).json(response);
  } catch (error) {
    console.error("Google sign-in error:", error);
    res.status(500).json({
      success: false,
      message: "Error signing in with Google",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  googleSignIn,
};
