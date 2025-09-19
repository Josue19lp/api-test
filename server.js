import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Conexión a MySQL
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  port: Number(process.env.MYSQLPORT),
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  connectTimeout: 10000
});

db.connect(err => {
  if (err) {
    console.error("Error al conectar a MySQL:", err.message);
    process.exit(1); // detiene la app si falla la conexión
  } else {
    console.log("Conectado a la base de datos");
  }
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// Rutas CRUD
app.post("/users", (req, res) => {
  const { nombre, email } = req.body;
  if (!nombre || !email) return res.status(400).json({ message: "Faltan datos" });
  db.query("INSERT INTO users (nombre, email) VALUES (?, ?)", [nombre, email], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, nombre, email });
  });
});

app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
