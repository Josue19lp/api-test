import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // parsea JSON automáticamente

// =================== CONEXIÓN A MYSQL ===================
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,       // Railway host
  port: Number(process.env.MYSQLPORT), // Railway port
  user: process.env.MYSQLUSER,       // Railway user
  password: process.env.MYSQLPASSWORD, // Railway password
  database: process.env.MYSQLDATABASE // Railway database
});

// Conectar a la base de datos
db.connect(err => {
  if (err) {
    console.error("Error al conectar a MySQL:", err.message);
    process.exit(1); // detener la app si falla la conexión
  } else {
    console.log("Conectado a la base de datos");
  }
});

// =================== RUTA DE PRUEBA ===================
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// =================== RUTAS CRUD ===================

// CREATE: Crear un usuario
app.post("/users", (req, res) => {
  const { nombre, email } = req.body;
  if (!nombre || !email) return res.status(400).json({ message: "Faltan datos" });

  const sql = "INSERT INTO users (nombre, email) VALUES (?, ?)";
  db.query(sql, [nombre, email], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, nombre, email });
  });
});

// READ: Listar todos los usuarios
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// READ ONE: Obtener usuario por ID
app.get("/users/:id", (req, res) => {
  const sql = "SELECT * FROM users WHERE id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(results[0]);
  });
});

// UPDATE: Actualizar usuario por ID
app.put("/users/:id", (req, res) => {
  const { nombre, email } = req.body;
  if (!nombre || !email) return res.status(400).json({ message: "Faltan datos" });

  const sql = "UPDATE users SET nombre = ?, email = ? WHERE id = ?";
  db.query(sql, [nombre, email, req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ id: req.params.id, nombre, email });
  });
});

// DELETE: Eliminar usuario por ID
app.delete("/users/:id", (req, res) => {
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado" });
  });
});

// =================== INICIAR SERVIDOR ===================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
