require('dotenv').config();
const express = require('express');
const listaController = require('./controllers/listaController');

const app = express();

app.use(express.json());

app.get('/listar', listaController.lista);
app.post('/renomear', listaController.renomear);
app.post('/excluir', listaController.excluir);
app.post('/mover', listaController.mover);
app.post('/copiar', listaController.copiar);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
