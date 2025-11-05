const User = require('../models/user');
const bcrypt = require('bcrypt');

const register = async(req,res)=> {

try{

  const {name ,email ,password , role }=req.body ;

  if( !name || !email || !password || !role)
    {
    return res.status(400).json({ success: false, message: "Please provide the missing credentials" });
    }
  
  if (!['customer', 'admin', 'staff'].includes(role))
    {
  return res.status(401).json({ success: false, message: "invalid role" });

    }

    const existingUser = await User.findOne({ email });

    if (existingUser)
    {
      return res.status(400).json({ message: "User already exists" });
    }

  const user = new user
    ({
        name: name,
        email: email,
        password: password,
        role: role,
        
    });

  const newBooking = await user.save();

  res.status(201).json({success: true , user });

}
catch(error)
{
  res.status(400).json({success: false , message: "registration failed" , eror: error.message})
}

};

const login = async(req,res)=>{

try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.export = authController;
