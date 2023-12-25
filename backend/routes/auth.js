const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchUser=require('../middleware/fetchUser');

const JWT_SECRET="melinaisgoodgirl";

// ROUTE1:create a user using: POST "/api/auth/createuser". No login required.
router.post(
  "/createuser",
  [
    body("name", "Enter the valid name ").isLength({ min: 3 }),
    body("email", "enter the unique email").isEmail(),
    body("password", "The password must be at least 6 characters.").isLength({
      min: 6,
    }),
  ],
  //if there are errors ,return badrequest and the errors
  async (req, res) => {
    let success=false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    //check whether the user with same email exists already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        res.status(400).json({success, error: "sorry the email exists already!" });
      }
      //create a user
      const salt = bcrypt.genSaltSync(10);
      const secPass =await bcrypt.hash(req.body.password,salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data={
        user:{
          id:user.id
        }
      }
      const authToken= jwt.sign(data,JWT_SECRET);

      // res.json(user);
      success=true;
      res.json({success, authToken});
    } 
    //catching error
    catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error:some error occured");
    }
  }
);

// ROUTE2: Authenticate a user using: POST "/api/auth/login". No login required.
router.post(
  "/login",
  [
    body("email", "enter the unique email").isEmail(),
    body("password", "password cannot be empty.").exists(),
  ],
  async (req, res) => {
    let success=false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {email, password}=req.body;
    try {
      let user =await User.findOne({email});
      if(!user)
      {
        success=false
        res.status(400).json({error:"Login with correct credentials."})
      }

      const passwordCompare=await bcrypt.compare(password, user.password);
      if(!passwordCompare){
        success=false;
        res.status(400).json({success, error:"Login with correct credentials."})
      }
      const data={
        user:{
          id:user.id
        }
      }
      const authToken= jwt.sign(data,JWT_SECRET);
      success=true;
      res.json({success, authToken});   
    } 
    catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error:some error occured");
    }
  })

  // ROUTE3: Get logged in user deatails using: POST "/api/auth/getuser".Login required.
  router.post('/getuser', fetchUser, async (req, res) => {
  try {
    userId=req.user.id;
    const user = await User.findById(userId).select("-password"); 
    res.send(user); 
  } catch (error) {
    console.error(error.message);
      res.status(500).send("Internal Server Error:some error occured");
  }
})


module.exports = router;
