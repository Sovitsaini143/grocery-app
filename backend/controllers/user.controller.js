import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

// register user
export const registerUser = async (req,res) => {
     try{
        const { name, email, password} = req.body;
        if(!name, !email, !password){
            return res.status(400). json({ success: false, message: " All fields are required"});
        }

        const existingUser = await User.findOne({ email});
        if(existingUser){
               return res.status(400). json({ success: false, message: " User already exits"});
        }

        const hashedPassword = await bcrypt.hash(password, 10)
     const user = new User({
      name,
      email,
      password: hashedPassword,
    });
      await user.save();
      const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

     res.cookie("token", token, {
      httpOnly: false, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict", // Prevent CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time (7 days)
    });

       res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
      token,
    });


     } catch (error){
        console.log(error);
        res.status(500).json({ message: "Internal server error"})
     }
};

//login user
export const loginUser = async (req,res) => {
    try{
        const { email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({message: "All fields are required", success: false});
        }
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: "Invalid email or password", success: false});
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

     res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

     res.status(200).json({
      message: "Logged in successfull",
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });

    } catch (error){
        console.log(error);
        res.status(500).json
    }
};

// logout user: /api/user/logout
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
    });
    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// check auth user
export const isAuthUser = async (req,res) => {
    try{
     const userId = req.user;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    res.status(200).json({
      success: true,
      user,
    });
    } catch (error){
         console.error("Error in checkAuth:", error);
    res.status(500).json({ message: "Internal server error" });
    }
}