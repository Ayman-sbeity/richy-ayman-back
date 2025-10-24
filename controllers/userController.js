import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  console.log('registerUser called with body:', req.body);
  const { name, email, password, type } = req.body;

  if (!name || !email || !password || !type) {
    return res.status(400).json({ message: "All fields are required (name, email, password, type)" });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({ message: "Name must be at least 2 characters long" });
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Please provide a valid email address" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  if (!['owner', 'realtor'].includes(type)) {
    return res.status(400).json({ message: "Type must be either 'owner' or 'realtor'" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password_hash: hashedPassword, type });
    const savedUser = await user.save();
    console.log('User created successfully:', savedUser._id);

    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      type: savedUser.type,
      token,
    });
  } catch (err) {
    console.error('Error in registerUser:', err);
    res.status(400).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  console.log('🔐 Login attempt for:', req.body.email);
  const { email, password } = req.body;
  const guestCartId = req.cookies.guestCartId;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Please provide a valid email address" });
  }

  try {
    console.log('🔍 Looking for user with email:', email);
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log('✅ User found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      type: user.type
    });

    const storedHash = user.password_hash;
    const isMatch = await bcrypt.compare(password, storedHash);
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log('✅ Password correct');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    if (guestCartId) {
      try {
        const { mergeGuestCart } = await import('../controllers/cartController.js');
        await mergeGuestCart(user._id, guestCartId);

        res.clearCookie('guestCartId');
      } catch (cartError) {
        console.error('Error merging carts:', cartError);
        
      }
    }

    const responseObject = {
      _id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
      token: token
    };

    console.log('📤 About to send response:', JSON.stringify(responseObject, null, 2));
    
    return res.status(200).json(responseObject);
  } catch (err) {
    console.error('💥 Login error:', err);
    return res.status(500).json({ message: err.message });
  }
};
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password_hash'); 
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Getting user by ID:', id);
    
  const user = await User.findById(id).select('-password_hash');
    
    if (!user) {
      console.log('❌ User not found with ID:', id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('✅ User found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (err) {
    console.error('💥 Error getting user by ID:', err);
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
  const { name, email, type, password } = req.body;
    
    console.log('🔄 Updating user with ID:', id);
    
    const user = await User.findById(id);
    if (!user) {
      console.log('❌ User not found with ID:', id);
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (type) user.type = type;

    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(password, salt);
    }
    
    await user.save();
    
    console.log('✅ User updated:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (err) {
    console.error('💥 Error updating user:', err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting user with ID:', id);
    
    const user = await User.findById(id);
    if (!user) {
      console.log('❌ User not found with ID:', id);
      return res.status(404).json({ message: "User not found" });
    }
    
    await User.findByIdAndDelete(id);
    console.log('✅ User deleted successfully');
    
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error('💥 Error deleting user:', err);
    res.status(500).json({ message: err.message });
  }
};
