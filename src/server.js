const express = require('express');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limite
    },
    fileFilter: (req, file, cb) => {
        // Permitir apenas imagens
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos'), false);
        }
    }
});

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Serviço de processamento de imagens rodando',
        timestamp: new Date().toISOString()
    });
});

// Rota principal
app.get('/', (req, res) => {
    res.json({
        message: 'Serviço de Processamento de Imagens',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            process: '/process (POST)'
        }
    });
});

// Rota para processar imagens
app.post('/process', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                erro: 'Nenhuma imagem foi enviada'
            });
        }

        // Por enquanto, apenas retorna info da imagem
        res.json({
            sucesso: true,
            mensagem: 'Imagem recebida com sucesso',
            arquivo: {
                nome: req.file.originalname,
                tamanho: req.file.size,
                tipo: req.file.mimetype
            }
        });

    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao processar imagem',
            detalhes: error.message
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;