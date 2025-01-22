const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuração mais permissiva do CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Responde a requisições OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Schema do número
const numberSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  operator: { type: String, required: true },
  type: { type: String, default: "Tipo Exemplo" },
  message: { type: String, default: "oii vi seu anuncio" },
  status: { type: String, default: "Ativo" }
});

const Number = mongoose.model('Number', numberSchema);

// Schema para o contador
const counterSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Rotas
app.get('/api/numbers', async (req, res) => {
  try {
    const numbers = await Number.find();
    res.json(numbers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/numbers', async (req, res) => {
  try {
    const number = new Number(req.body);
    await number.save();
    res.status(201).json(number);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/numbers/:id', async (req, res) => {
  try {
    const number = await Number.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(number);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/numbers/:id', async (req, res) => {
  try {
    await Number.findByIdAndDelete(req.params.id);
    res.json({ message: 'Número deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para pegar e incrementar o contador
app.get('/api/counter', async (req, res) => {
    try {
        let counter = await Counter.findOne({ key: 'numberIndex' });
        
        if (!counter) {
            counter = new Counter({ key: 'numberIndex', value: 0 });
        }

        const currentValue = counter.value;
        
        // Incrementa o contador
        counter.value = (currentValue + 1);
        await counter.save();
        
        res.json({ value: currentValue });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));