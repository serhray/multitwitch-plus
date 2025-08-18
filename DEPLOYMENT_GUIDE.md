# 🚀 Guia de Deploy - Multitwitch+ (Serverless)

## ✅ **Configuração Completa para Vercel**

### **1. Preparação do Projeto**

O projeto está configurado para deploy serverless no Vercel com:
- Frontend React em `/client`
- API serverless em `/api`
- Chat polling (sem Socket.IO)
- Sistema de autenticação OAuth

### **2. Variáveis de Ambiente no Vercel**

Configure estas variáveis no dashboard do Vercel:

```bash
# Twitch OAuth
TWITCH_CLIENT_ID=seu_client_id_aqui
TWITCH_CLIENT_SECRET=seu_client_secret_aqui

# JWT para autenticação
JWT_SECRET=sua_chave_secreta_jwt_aqui

# AdSense (opcional)
REACT_APP_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXXX
REACT_APP_ADSENSE_BANNER_SLOT=1234567890
REACT_APP_ADSENSE_SIDEBAR_SLOT=0987654321
```

### **3. Configuração da Aplicação Twitch**

1. Acesse [Twitch Developers Console](https://dev.twitch.tv/console)
2. Crie uma nova aplicação
3. Configure o redirect URI: `https://seu-dominio.vercel.app/api/auth?action=callback`
4. Copie Client ID e Client Secret

### **4. Deploy no Vercel**

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login no Vercel
vercel login

# 3. Deploy
vercel

# 4. Configurar domínio de produção
vercel --prod
```

### **5. Estrutura de Arquivos**

```
projeto/
├── api/                    # Serverless functions
│   ├── auth.js            # OAuth Twitch
│   ├── chat.js            # Chat polling
│   ├── emotes.js          # BTTV/Twitch emotes
│   ├── translate.js       # Tradução
│   ├── index.js           # Health check
│   └── package.json       # Dependencies
├── client/                 # Frontend React
│   ├── src/
│   ├── public/
│   └── package.json
└── vercel.json            # Configuração deploy
```

### **6. Funcionalidades Implementadas**

✅ **Core Features:**
- Multistream viewing
- Chat unificado com polling
- Sistema de emotes (BTTV + Twitch)
- Autenticação OAuth Twitch
- Tradução de mensagens
- Controle de áudio
- Layout responsivo

✅ **Monetização:**
- Google AdSense integrado
- Modo premium ready
- Configuração por env vars

### **7. Limitações Serverless**

❌ **Removido:**
- Socket.IO (substituído por polling)
- Chat em tempo real (agora usa polling de 2s)
- Algumas funcionalidades avançadas de chat

✅ **Mantido:**
- Todas as funcionalidades principais
- Autenticação completa
- Sistema de emotes
- Interface moderna

### **8. Comandos Úteis**

```bash
# Desenvolvimento local
npm run dev

# Build de produção
npm run build

# Deploy direto
vercel --prod

# Logs de produção
vercel logs
```

### **9. Troubleshooting**

**Erro de CORS:**
- Verificar configuração de domínios no Twitch
- Conferir headers CORS nas APIs

**Autenticação não funciona:**
- Verificar redirect URI no Twitch
- Conferir variáveis de ambiente

**Chat não carrega:**
- Verificar endpoints `/api/chat`
- Logs do Vercel para debug

### **10. Próximos Passos**

1. **Deploy inicial:** Configure env vars e faça primeiro deploy
2. **Teste funcionalidades:** Autenticação, chat, emotes
3. **AdSense:** Configure conta e IDs de anúncios
4. **Domínio custom:** Configure domínio próprio
5. **Monitoramento:** Configure analytics e logs

---

## 🎯 **Deploy Checklist**

- [ ] Variáveis de ambiente configuradas
- [ ] Aplicação Twitch criada
- [ ] Primeiro deploy realizado
- [ ] Autenticação testada
- [ ] Chat funcionando
- [ ] Emotes carregando
- [ ] AdSense configurado (opcional)
- [ ] Domínio custom (opcional)

**Status:** ✅ Pronto para deploy!
