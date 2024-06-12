const express = require("express"); 
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchuser')

// jsonwebtoken - used for authentication and authorization in web applications.
// it has three parts:
// 1. Header(Algorithm and Token Type)
// 2. Payload(Data) - here I have used userid
// 3. Verify Signature 
// It is used so that the user need not to login/signup again 
const JWT_SECRET = 'Abhisheknigam' // should be put in env.local
const router = express.Router();
 
// create user : no login req.
router.post("/createuser",[
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid mail").isEmail(),
    body("password", "Invalid Password").isLength({ min: 5 }),],
    async (req, res) => {
    // if validation error, return
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({success, error: "Sorry, User already exist" });
      }
      // else, create user and save
      const salt = await bcrypt.genSalt(10)
      const secPass = await bcrypt.hash(req.body.password, salt)
      // ^ since, DB is prone to hackers, hashes of password is stored on DB, instead of the same password
      // Even then, the hackers have table of common passwords and their hashes(known as rainbow table) which they can use to hack any account having common password, therefore some sequence of characters is added/appended to the password(salt) to make it non-trivial
      // another layer pepper can also be added 

      // In Mongoose, the Model.create() method is used to create a new document (an object) based on the provided data (an object or an array of objects) and save it to the MongoDB database.
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass
      });
      const data = {
        user:{
          id: user.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET)
      
      success=true
      res.json({success, authtoken});

    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error!");
    }
  }
);

// Authenticate : no login req.
router.post("/login",[
  body("email", "Enter a valid mail").isEmail(),
  body("password", "Password cannot be blank").exists()],
  async (req, res) => {
  // if validation error, return
  let success = false
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {email, password} = req.body
  try {
    let user = await User.findOne({email})
    // if the user does not exists with the given credentials
    if(!user){
      return res.status(400).josn({success, error: "Try with correct credentials."})  
    }
    
    const passwordCompare = await bcrypt.compare(password, user.password)
    // if the user entered wrong password
    if(!passwordCompare){
      return res.status(400).json({success, error: "Try with correct credentials."})  
    }
    const data = {
      user:{
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET)
    success = true;
    res.json({success, authtoken});

  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error!");
  }
  
})

// get user details : login req.
router.post('/getuser', fetchuser, async (req, res)=>{
  // here we use middleware
  // middleware is basically a function that will be by the endpoints that requires authentication(or login required)
  // it has been written seperately, so that in future it may be used by some other endpoints that requires authentication
  try {
    userId = req.user.id; 
    // find all fields corresponding to userId except the password field
    const user = await User.findById(userId).select('-password')
    res.send(user)
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error!");
  }

})

module.exports = router;
