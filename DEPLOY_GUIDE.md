# 🚀 Guia de Deploy no Vercel

## **Pré-requisitos**

1. **Conta no Vercel**: https://vercel.com
2. **Repositório Git** (GitHub, GitLab, Bitbucket)
3. **Variáveis de ambiente** configuradas

## **Configuração do Deploy**

### **1. Estrutura do Projeto**
```
multitwitch-plus/
├── client/          # React frontend
├── server/          # Node.js backend
├── vercel.json      # Configuração Vercel
├── package.json     # Scripts principais
└── .vercelignore    # Arquivos ignorados
```

### **2. Variáveis de Ambiente no Vercel**

**Backend (Server):**
```env
TWITCH_CLIENT_ID=seu_twitch_client_id
TWITCH_CLIENT_SECRET=seu_twitch_client_secret
TWITCH_ACCESS_TOKEN=seu_twitch_access_token
PORT=5001
```

**Frontend (Client):**
```env
REACT_APP_SERVER_URL=https://seu-projeto.vercel.app
REACT_APP_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXXX
REACT_APP_ADSENSE_BANNER_SLOT=1234567890
REACT_APP_ADSENSE_SIDEBAR_SLOT=0987654321
REACT_APP_ENABLE_ADS=true
```

### **3. Comandos de Deploy**

**Via CLI:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy inicial
vercel

# Deploy de produção
vercel --prod
```

**Via GitHub:**
1. Push para repositório
2. Conectar no painel Vercel
3. Deploy automático

## **Configuração Específica**

### **vercel.json Explicado**

```json
{
  "builds": [
    {
      "src": "client/package.json",  // Build React
      "use": "@vercel/static-build"
    },
    {
      "src": "server/index.js",      // Build Node.js
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server/index.js" },     // API routes
    { "src": "/socket.io/(.*)", "dest": "/server/index.js" }, // WebSocket
    { "src": "/(.*)", "dest": "/client/build/index.html" }   // Frontend
  ]
}
```

### **Limitações Vercel**

⚠️ **WebSocket/Socket.IO:**
- Vercel Hobby: limitado
- Considerar alternativas:
  - Vercel Pro
  - Railway/Render para backend
  - Separar frontend/backend

⚠️ **Twitch API:**
- Configurar CORS adequadamente
- Verificar rate limits

## **Passos para Deploy**

### **1. Preparação**
```bash
# Instalar dependências
npm run install-all

# Testar build local
npm run build
```

### **2. Configurar Vercel**
1. Criar projeto no painel
2. Conectar repositório
3. Configurar variáveis de ambiente
4. Definir build commands

### **3. Deploy**
```bash
vercel --prod
```

### **4. Pós-Deploy**
- Testar funcionalidades
- Configurar domínio customizado
- Ativar AdSense
- Monitorar logs

## **Troubleshooting**

**Build Errors:**
- Verificar dependências
- Checar variáveis de ambiente
- Logs no painel Vercel

**Socket.IO Issues:**
- Considerar backend separado
- Usar polling fallback
- Verificar CORS

**Twitch API:**
- Whitelist domínio Vercel
- Verificar tokens válidos
- Rate limiting

## **Alternativas de Deploy**

**Frontend (Vercel/Netlify):**
- Vercel: Melhor para Next.js
- Netlify: Boa para React

**Backend separado:**
- Railway: Suporte completo WebSocket
- Render: Free tier generoso
- Heroku: Tradicional e confiável

**Fullstack:**
- Railway: Deploy completo
- DigitalOcean App Platform
- AWS Amplify
