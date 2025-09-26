## Microsserviço para Processamento de Imagens

> Microserviço para processamento de imagens com redimensionamento, compressão e conversão de formatos.

## Descrição
Microserviço desenvolvido em Node.js para processamento de imagens com funcionalidades essenciais:
- Upload de imagens (JPG, PNG, WebP)
- Redimensionamento com controle de largura e altura
- Compressão com ajuste de qualidade
- Conversão entre formatos de imagem
- Interface web integrada para testes

## Tecnologias
- Node.js, Express
- Sharp (processamento de imagens)
- Multer (upload de arquivos)
- HTML5 (interface web)

## Funcionalidades
- Upload de imagens
- Redimensionamento com parâmetros width/height
- Compressão com controle de qualidade
- Conversão para JPG, PNG e WebP
- Interface web com formulários para todas as funcionalidades
- Respostas em JSON com imagem em base64

## Como rodar
```bash
npm install
npm start
```

Acesse `http://localhost:3000` para usar a interface web.

## Estrutura do projeto
```
src/
  server.js
index.html
```
