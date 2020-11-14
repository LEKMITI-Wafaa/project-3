const express = require('express')
const bcryptjs = require('bcryptjs')
const mongoose = require('mongoose')
const { body, check, validationResult } = require('express-validator');
const fileUploader = require('../configs/cloudinary.config');

const User = require('../models/User.model.js');
const Service = require("../models/Services.model.js");

const router = express.Router()

router.post('/',fileUploader.single('image'), [
  body('firstname', 'first name must have at least 3 chars').isLength({ min: 3 }),
  body('lastname', 'last name must have at least 3 chars').isLength({ min: 3 }),
  body('email', 'email is not valid').isEmail(),
  check('password')
    .isLength({ min: 8 }).withMessage('password must be at least 8 chars long.')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/).withMessage('Password must contain at least a number, an uppercase ans a lowercase')
], async(req, res) => {

  const { firstname, lastname, service, role, email } = req.body;

  const result = validationResult(req);
  if (req.body.password != req.body.confirmPassword) {
    req.session.errors = ['password and confirm password fields are not identical.']
    res.status(400).json({message: req.session.errors})
    return;

  }
  if (!result.isEmpty()) {
    //Ancien code: req.session.errors = result.errors.map(e => e.msg)
    res.status(400).json({message: result.errors.map(e => e.msg)})
    return;
  } else {
    const isUserExist = await User.findOne({email: req.body.email})
    if(isUserExist) {
    req.session.errors = ['a user already exist with that email address.']
    res.status(400).json({message: req.session.errors})
    return;
    } else {
      const passwordHash = bcryptjs.hashSync(req.body.password, 10); 
      const imageURL = req.file ? req.file.path : 'https://res.cloudinary.com/dshuazgaz/image/upload/v1602411437/avatar_el8zal.webp'
      
      const aNewUser = new User({firstname, lastname, service, role, email, passwordHash, imageURL});
      aNewUser.save()
      .then(() => {
        // Persist our new user into session
        req.session.currentUser = aNewUser

       res.status(201).json(aNewUser);
      })
      .catch(err => {
        res.status(400).json({ message: 'Saving user to database went wrong.' });
      })
    }

  }
  

})

module.exports = router;

