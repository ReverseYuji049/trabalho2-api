const express = require('express');
const db = require('./database');
const app = express();

app.use(express.json());

// GET: Listar livros
app.get('/api/livros', (req, res) => {
    db.all("SELECT * FROM livros", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: err.message});
        }
        res.json(rows);
    });
});

// GET: Busca por ID
app.get('/api/livros/:id', (req, res) => {
    db.get("SELECT * FROM livros WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    if (!row) {
      return res.status(404).json({ erro: "Livro não encontrado" });
    }
    res.json(row);
  });
});

// POST: Criar livro
app.post('/api/livros', (req, res) => {
    const { titulo, autor, genero, paginas } = req.body;

    // Verificação de campos obrigatórios
    if (
        titulo === undefined ||
        autor === undefined ||
        genero === undefined ||
        paginas === undefined
    ) {
    return res.status(400).json({ erro: "Campos obrigatórios" });
}

    // Verificação de tipos inválidos
    if (
        typeof titulo !== "string" || titulo.trim() === "" ||
        typeof autor !== "string" || autor.trim() === "" ||
        typeof genero !== "string" || genero.trim() === "" ||
        typeof paginas !== "number" || paginas <= 0
    ) {
        return res.status(400).json({ erro: "Dados inválidos" });
    }

    const sql = `
        INSERT INTO livros (titulo, autor, genero, paginas)
        VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [titulo, autor, genero, paginas], function(err) {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }

        res.status(201).json({
            id: this.lastID,
            titulo,
            autor,
            genero,
            paginas
        });
    });
});

// PUT:
app.put('/api/livros/:id', (req, res) => {
    const { titulo, autor, genero, paginas} = req.body;

     const sql = `
    UPDATE livros
    SET titulo = ?, autor = ?, genero = ?, paginas = ?
    WHERE id = ?
  `;

  db.run(sql, [titulo, autor, genero, paginas, req.params.id], function(err) {
    if (err) {
        return res.status(500).json({ erro: err.message });
    }

    if (this.changes === 0) {
        return res.status(404).json({ erro: "Livro não encontrado "});
    }

    res.json({ mensagem: "Livro atualizado" })
  });
});
app.delete('/api/livros/:id', (req, res) => {
  db.run("DELETE FROM livros WHERE id = ?", [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ erro: "Livro não encontrado" });
    }

    res.json({ mensagem: "Livro removido" });
  });
});

app.listen(3001, () => {
  console.log("🚀 API com banco rodando em http://localhost:3001'!");
});
