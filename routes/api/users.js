const mongoose = require('mongoose');
const config = require("../../configs/auth.config");
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
//POST new user route (optional, everyone has access)
router.post('/', auth.required, (req, res, next) => {
  console.log("=========req", req.body)
  const { email, password, bio, image, username  } = req.body;

  if(!email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if(!password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }
  const user = {email, password, bio, image, username}
  const finalUser = new Users(user);

  finalUser.setPassword(password);

  return finalUser.save()
    .then(() => res.json({ user: finalUser.toAuthJSON() }));
});


router.post('/login' , auth.optional, (req, res, next) => {
  Users.findOne({
    username: req.body.username
  })
    .populate( "-__v", "password")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (!user) {
        return res.status(404).send({message: "User Not found."});
      }
      
      console.log('user', user.password === req.body.password)
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      
      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      if (!user.password === req.body.password) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 111186400 
      });

      var authorities = [];

      // for (let i = 0; i < user.roles.length; i++) {
      //   authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      // }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token
      });
    });
});

router.post("/changeData", auth.required, async (req, res) => {
  const user =  await Users.findOne({
    email: req.body.user
  })

  const update = { password: bcrypt.hashSync(req.body.password, 8)}
  await user.updateOne(update);
  await user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    return res.status(200).send({message: "Password updated!"})
  });
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
  const { payload: { id } } = req;

  return Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }

      return res.json({ user: user.toAuthJSON() });
    });
});

module.exports = router;