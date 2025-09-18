import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();

// Puerto dinámico para Railway
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Solo parsea JSON si hay body
app.use((req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    express.json()(req, res, next);
  } else {
    next();
  }
});

// =================== CONFIGURACIÓN DE BASE DE DATOS ===================

// Conexión local (para pruebas)
const localDB = {
  host: "127.0.0.1",
  user: "root",
  password: "12345678",
  database: "crud_db",
};

// Conexión remota en Railway
const remoteDB = {
  host: process.env.DB_HOST,       // Ej: 'containers-us-west-123.railway.app'
  user: process.env.DB_USER,       // Ej: 'root'
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Cambiar según USE_REMOTE_DB
const dbConfig = process.env.USE_REMOTE_DB === "true" ? remoteDB : localDB;

const db = mysql.createConnection(dbConfig);

// Conectar a la base de datos
db.connect(err => {
  if (err) {
    console.error("Error al conectar a MySQL:", err.message);
  } else {
    console.log("Conectado a la base de datos");
  }
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

// READ ALL: Listar todos los usuarios
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
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
