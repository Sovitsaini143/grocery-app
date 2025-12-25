import User from "../models/user.model.js";


export const updateCart = async (req, res) => {
    try{
        const userId = req.user;
        const { cartItems } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {  cartItems},
            {new: true}
        );
        if (!updatedUser){
            return res.status(400).json({ message: "User not found", success: false});
        }
        res.status(200).json({ updatedUser, success: true});
    } catch(error){
        res.status(500).json({ message: "Server error", error: error.message})
    }
};