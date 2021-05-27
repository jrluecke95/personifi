var express = require('express');
var router = express.Router();
const models = require('../models');
const bcrypt = require('bcrypt');
const path = require('path');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// localhost:3000/api/v1/users/register
router.post('/register', async (req, res) => {
  // check for each item in form
  if (!req.body.email || !req.body.password || !req.body.firstName || !req.body.lastName || !req.body.street || !req.body.city || !req.body.state || !req.body.zipcode) {
    return res.status(400).json({
      error: 'please fill out all fields in form'
    })
  }
  //check database for existing user
  const user = await models.User.findOne({
    where: {
      email: req.body.email
    }
  })
  //if exists, send error
  if (user) {
    return res.status(400).json({
      error: 'user already exists'
    })
  }

  // hash password
  const hash = await bcrypt.hash(req.body.password, 10)
  // create user
  const newUser = await models.User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hash,
    street: req.body.street,
    zipcode: req.body.zipcode,
    city: req.body.city,
    state: req.body.state,
  })
  // respond with success message
  return res.status(201).json(newUser)
})

router.post('/login', async (req, res) => {
  console.log(req.body)
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      error: 'please fill out all required fields'
    })
  }

  const user = await models.User.findOne({
    where: {
      email: req.body.email
    }
  })

  if (!user) {
    return res.status(401).json({
      error: "Could not find user with that email"
    })
  }

  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) {
    return res.status(401).json({
      error: 'incorrect password'
    })
  }

  req.session.user = user

  return res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    street: user.street,
    city: user.city,
    state: user.state,
    zipcode: user.zipcode,
  })
})



module.exports = router;
