const express = require('express');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Rota principal - interface web
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Rota de informações da API
app.get('/api', (req, res) => {
    res.json({
        message: 'Image Processing Service API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            process: '/process (POST) - parâmetros: ?width=300&height=200&quality=80&format=jpg'
        },
        parametros: {
            width: 'largura desejada (opcional)',
            height: 'altura desejada (opcional)',
            quality: 'qualidade da imagem 1-100 (padrão: 80)',
            format: 'formato de saída: jpg, png, webp (opcional)'
        }
    });
});

// Rota para processar imagens
app.post('/process', (req, res) => {
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Apenas arquivos de imagem são permitidos'), false);
            }
        }
    }).single('image');

    upload(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({
                    erro: 'Erro no upload',
                    detalhes: err.message
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    erro: 'Nenhuma imagem foi enviada'
                });
            }

            // Parâmetros do query string
            const width = parseInt(req.query.width) || null;
            const height = parseInt(req.query.height) || null;
            const quality = parseInt(req.query.quality) || 80;
            const format = req.query.format || null; // jpg, png, webp

            // Processar a imagem com Sharp
            let processedImage = sharp(req.file.buffer);

            // Redimensionar se largura ou altura foram especificadas
            if (width || height) {
                processedImage = processedImage.resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true
                });
            }

            // Determinar formato final
            let finalFormat = format;
            let finalMimeType = req.file.mimetype;

            if (format) {
                // Conversão de formato solicitada
                if (format === 'jpg' || format === 'jpeg') {
                    processedImage = processedImage.jpeg({ quality });
                    finalFormat = 'jpg';
                    finalMimeType = 'image/jpeg';
                } else if (format === 'png') {
                    processedImage = processedImage.png({ quality });
                    finalMimeType = 'image/png';
                } else if (format === 'webp') {
                    processedImage = processedImage.webp({ quality });
                    finalMimeType = 'image/webp';
                }
            } else {
                // Manter formato original com compressão
                if (req.file.mimetype === 'image/jpeg') {
                    processedImage = processedImage.jpeg({ quality });
                } else if (req.file.mimetype === 'image/png') {
                    processedImage = processedImage.png({ quality });
                } else if (req.file.mimetype === 'image/webp') {
                    processedImage = processedImage.webp({ quality });
                }
            }

            const outputBuffer = await processedImage.toBuffer();
            const metadata = await sharp(outputBuffer).metadata();

            res.json({
                sucesso: true,
                mensagem: 'Imagem processada com sucesso',
                original: {
                    nome: req.file.originalname,
                    tamanho: req.file.size,
                    tipo: req.file.mimetype
                },
                processada: {
                    largura: metadata.width,
                    altura: metadata.height,
                    tamanho: outputBuffer.length,
                    qualidade: quality,
                    formato: finalFormat || req.file.mimetype.split('/')[1],
                    tipo: finalMimeType
                },
                imagem: outputBuffer.toString('base64')
            });

        } catch (error) {
            res.status(500).json({
                erro: 'Erro ao processar imagem',
                detalhes: error.message
            });
        }
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;