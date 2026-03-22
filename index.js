
// Importa o framework Express/dependências (criação do API)
const express = require('express');

// Importa o banco de dados
const db = require('./database');

// Cria a aplicação Express
const app = express();

// Permite que o API compreenda o JSON no body das requisições
app.use(express.json());

// GET: Listar livros
app.get('/api/livros', (req, res) => { // req = requisição do cliente, res = resposta da API
    // Consulta SQL para buscar todos os livros
    db.all("SELECT * FROM livros", [], (err, rows) => { // err = erro, rows = linhas retornadas do db
        if (err) { // Erro no banco de dados
            return res.status(500).json({ erro: err.message}); // Erro genérico do servidor
        }
        res.json(rows); // Retorna todos os livros encontrados
    });
});

// GET: Busca por ID
app.get('/api/livros/:id', (req, res) => {
    db.get("SELECT * FROM livros WHERE id = ?", [req.params.id], (err, row) => {
    
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    // Se não encontrou o livro, retorna o erro 404 Not Found  
    if (!row) {
      return res.status(404).json({ erro: "Livro não encontrado" });
    }
    res.json(row); // Retorna o livro encontrado
  });
});

// POST: Criar um novo livro
app.post('/api/livros', (req, res) => {

    // Pega os dados enviados no body na requisição
    const { titulo, autor, genero, paginas } = req.body;

    // Verificação de campos obrigatórios
    if (
        titulo === undefined ||
        autor === undefined ||
        genero === undefined ||
        paginas === undefined
    ) {

    // Retorna o erro 400 Bad Request
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
    // Query SQL para inserir no banco de dados
    const sql = `
        INSERT INTO livros (titulo, autor, genero, paginas)
        VALUES (?, ?, ?, ?)
    `;
    // Executa o INSERT
    db.run(sql, [titulo, autor, genero, paginas], function(err) {
        
        if (err) {
            return res.status(500).json({ erro: err.message });
        }

        // Retorna o livro criado com status code 201 Created
        res.status(201).json({
            id: this.lastID, // ID do registro criado
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
    // 'this.changes' = números de registros afetados/alterados

    // Se nenhum registro foi alterado
    if (this.changes === 0) {
        return res.status(404).json({ erro: "Livro não encontrado "});
    }
    // Retorna o livro atualizado
    res.json({ mensagem: "Livro atualizado" })
  });
});
app.delete('/api/livros/:id', (req, res) => {
  
  // 'WHERE id = ?' evita SQL Injection (invasão/manipulação do db) por segurança 
  db.run("DELETE FROM livros WHERE id = ?", [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    // Se não encontrou o livro
    if (this.changes === 0) {
      return res.status(404).json({ erro: "Livro não encontrado" });
    }

    res.json({ mensagem: "Livro removido" });
  });
});

// Inicializa o servidor
app.listen(3001, () => {
  console.log("🚀 API com banco rodando em http://localhost:3001'!");
});
