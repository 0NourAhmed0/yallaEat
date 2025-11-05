const User = require('../models/user');
const bcrypt = require('bcrypt');


// View all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Add new staff
const addStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists with this email' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStaff = new User({ name, email, password: hashedPassword, role: 'staff' });
    await newStaff.save();

    res.status(201).json({ message: 'Staff account created successfully', newStaff });
  } catch (error) {
    res.status(500).json({ message: 'Error adding staff', error: error.message });
  }
};

// Update staff
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const updatedStaff = await User.findByIdAndUpdate(id, { name, email }, { new: true });
    if (!updatedStaff) return res.status(404).json({ message: 'Staff not found' });

    res.status(200).json({ message: 'Staff updated successfully', updatedStaff });
  } catch (error) {
    res.status(500).json({ message: 'Error updating staff', error: error.message });
  }
};

// Delete staff
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStaff = await User.findByIdAndDelete(id);
    if (!deletedStaff) return res.status(404).json({ message: 'Staff not found' });

    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting staff', error: error.message });
  }
};

// Disable customer
const disableCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, { disabled: true }, { new: true });

    if (!updatedUser) return res.status(404).json({ message: 'Customer not found' });
    res.status(200).json({ message: 'Customer disabled successfully', updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error disabling customer', error: error.message });
  }
};
module.exports = {
    getAllUsers,
    addStaff,
    updateStaff,
    deleteStaff,
    disableCustomer

};
