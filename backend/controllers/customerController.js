const User = require('../models/user');
const bcrypt = require('bcrypt');


const updateCustomerProfile = async(req,res)=> {

try {

    const updates = req.body;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });

  } catch (error) {
    res.status(400).json({ success: false, message: "Profile update failed", error: error.message });
  }

};

const deleteCustomerProfile = async(req,res)=> {

try {
    const user = await User.findByIdAndDelete(req.user._id);

    if(!user){
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });

  } catch (error) {
    res.status(500).json({ success: false, message: "failed to delete customer profile", error: error.message });
  }
};

// const getAllMyOrders = async(req,res)=> {

// }

module.export = customerController;





