const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./livros.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS livros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      autor TEXT NOT NULL,
      genero TEXT NOT NULL,
      paginas INTEGER NOT NULL
    )
  `);
});

console.log('Banco de dados criado!')

module.exports = db;
