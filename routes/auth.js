const router = require("express").Router();
const User = require("../models/User");
const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const schemaRegister = Joi.object({
  name: Joi.string().min(6).max(255).required(),
  email: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(6).max(1024).required(),
});

const schemaLogin = Joi.object({
  email: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(6).max(1024).required(),
});

router.post("/login", async (req, res) => {
  const { error } = schemaLogin.validate(req.body);

  if (error) return res.status(400).json({ error: error.message });

  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return res
      .status(400)
      .json({ error: true, message: "Email no encontrado" });

  const validatPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!validatPassword)
    return res
      .status(400)
      .json({ error: true, message: "Error en el password" });

  const token = jwt.sign(
    {
      id: user._id,
      name: user.name,
    },
    process.env.TOKEN_SECRET
  );

  res.header("auth-token", token).json({ error: true, data: { token } });
});

router.post("/register", async (req, res) => {
  const { error } = schemaRegister.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  const validatEmail = await User.findOne({ email: req.body.email });

  if (validatEmail)
    return res.status(400).json({ error: true, message: "Email ya existente" });

  // Encriptar contraseña
  const salto = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salto);
  console.log(password);
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password,
  });
  try {
    const userDB = await user.save();
    res.json({
      error: null,
      data: userDB,
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
