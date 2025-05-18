const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Mock Google user data for testing
const mockGoogleUser = {
  id: '123456789',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
};

// Generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Mock Google Sign In
const googleSignIn = async (req, res) => {
  try {
    console.log('Google sign-in attempt started');
    const { id, email, name, picture } = mockGoogleUser;

    // Validate required fields
    if (!email || !name) {
      console.error('Missing required fields:', { email, name });
      return res.status(400).json({
        success: false,
        message: 'Missing required user information'
      });
    }

    // First, try to find user by email
    let user = await User.findOne({ email });
    console.log('User lookup result:', user ? 'User found' : 'User not found');

    if (user) {
      // User exists, update their Google information
      try {
        user.googleId = id;
        user.authProvider = 'google';
        user.photo = picture;
        user.isVerified = true;
        await user.save();
        console.log('Updated existing user with Google information');
      } catch (updateError) {
        console.error('Error updating user:', updateError);
        // Continue with sign in even if update fails
      }
    } else {
      // Create new user
      try {
        console.log('Attempting to create new user with data:', {
          name,
          email,
          googleId: id,
          photo: picture,
          authProvider: 'google'
        });

        // Create user object
        const newUser = {
          name,
          email,
          googleId: id,
          photo: picture,
          authProvider: 'google',
          isVerified: true
        };

        // Validate the data before creating
        const validationError = new User(newUser).validateSync();
        if (validationError) {
          console.error('Validation error:', validationError);
          return res.status(400).json({
            success: false,
            message: 'Invalid user data',
            error: validationError.message
          });
        }

        // Create the user
        user = await User.create(newUser);
        console.log('New user created successfully:', user._id);
      } catch (createError) {
        console.error('Error creating user:', createError);
        
        // Handle specific error cases
        if (createError.code === 11000) {
          // Duplicate key error - try to find the user again
          user = await User.findOne({ email });
          if (user) {
            console.log('Found existing user after duplicate key error');
            // Update user with Google info
            user.googleId = id;
            user.authProvider = 'google';
            user.photo = picture;
            user.isVerified = true;
            await user.save();
          } else {
            return res.status(500).json({
              success: false,
              message: 'Error creating user account - duplicate email'
            });
          }
        } else if (createError.name === 'ValidationError') {
          return res.status(400).json({
            success: false,
            message: 'Invalid user data',
            error: createError.message
          });
        } else {
          return res.status(500).json({
            success: false,
            message: 'Error creating user account',
            error: process.env.NODE_ENV === 'development' ? createError.message : undefined
          });
        }
      }
    }

    // Generate token
    let token;
    try {
      token = generateToken(user._id);
      console.log('Token generated successfully');
    } catch (tokenError) {
      console.error('Error generating token:', tokenError);
      return res.status(500).json({
        success: false,
        message: 'Error generating authentication token'
      });
    }

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax'
    });
    console.log('Cookie set successfully');

    // Send response
    const response = {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role
      }
    };
    console.log('Sending successful response');
    res.status(200).json(response);
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Error signing in with Google',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  googleSignIn,
}; 