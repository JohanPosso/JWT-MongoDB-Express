const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
require("dotenv").config();

const app = express();

// capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Conexión a Base de datos
const uri = `mongodb+srv://${process.env.USERDB}:${process.env.PASSWORD}@cluster0.oh0cbpw.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Base de datos conectada"))
  .catch((e) => console.log("error db:", e));

// Importar routes
const authRoutes = require("./routes/auth");
const admin = require("./routes/admin");
const validaToken = require("./routes/validate-token");

app.use("/api/user", authRoutes);
app.use("/api/admin", validaToken, admin);

app.get("/", (req, res) => {
  res.send("Hola");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en el puerto " + PORT);
});
