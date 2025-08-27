# 🚀 Multitwitch+ 

Uma plataforma avançada de streaming que permite assistir múltiplas streams da Twitch e Kick simultaneamente com recursos inteligentes de áudio, chat unificado e funcionalidades de comunidade.

## ✨ Funcionalidades

### 🎵 Controle de Áudio Inteligente
- **Troca automática de áudio**: O áudio ativa sozinho quando o streamer começa a falar mais alto
- **Mixagem de áudio**: Diminui o volume dos streams secundários automaticamente
- **Controle individual**: Ajuste o volume de cada stream independentemente

### 🌐 Suporte Multi-Plataforma
- **Twitch**: Suporte completo para streams da Twitch
- **Kick**: Suporte completo para streams da Kick
- **Detecção automática**: Detecta automaticamente a plataforma baseado no nome do streamer
- **Busca unificada**: Busca streamers em ambas as plataformas simultaneamente

### 📺 Modo Stream Principal Dinâmico
- **Detecção de atividade**: Identifica qual streamer está mais ativo
- **Layout fluido**: Player grande para o stream principal e menores para secundários
- **Alternância suave**: Transições animadas entre streams

### 💬 Chat Unificado
- **Multi-canal**: Junta chats de vários canais em um único painel
- **Tradução automática**: Traduz mensagens para o idioma do usuário
- **Tags de canal**: Identifica de qual canal veio cada mensagem
- **Plataforma**: Funciona apenas com streams da Twitch

### 🏠 Salas de Watch Party
- **Assistir juntos**: Crie salas para grupos assistirem streams em conjunto
- **Chat interno**: Converse com outros usuários da sala
- **Votação**: Vote em qual stream deve ficar em destaque
- **Sincronização**: Players sincronizados entre todos os usuários

### ✂️ Ferramentas de Clipes
- **Editor rápido**: Botão direto para o editor oficial da Twitch
- **Buffer de replay**: Guarda 30 segundos de cada stream para rever momentos

### 📊 Modo Streamer+
- **Analytics em tempo real**: Dados de viewers, tempo online, engajamento
- **Ranking dinâmico**: Classificação por audiência ou atividade
- **Informações detalhadas**: Jogos, títulos, tags e estatísticas

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** + **Express.js** - Servidor web
- **Socket.IO** - Comunicação em tempo real
- **Axios** - Requisições HTTP
- **Twitch API** - Dados dos streams da Twitch
- **Kick API** - Dados dos streams da Kick
- **Google Translate API** - Tradução de mensagens

### Frontend
- **React 18** - Interface do usuário
- **Styled Components** - Estilização
- **Framer Motion** - Animações
- **React Router** - Navegação
- **Socket.IO Client** - WebSocket cliente

## 🚀 Como Executar

### 1. Pré-requisitos
```bash
# Node.js 16+ e npm
node --version
npm --version
```

### 2. Configuração das APIs

#### Twitch API
1. Acesse [Twitch Developers](https://dev.twitch.tv/console)
2. Crie uma nova aplicação
3. Copie o **Client ID** e **Client Secret**

#### Google Translate API (Opcional)
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Ative a Translate API
3. Crie uma chave de API

### 3. Configuração do Ambiente
```bash
# Clone ou navegue até o diretório do projeto
cd "twitch projeto"

# Copie o arquivo de exemplo
copy .env.example .env

# Edite o arquivo .env com suas credenciais
# TWITCH_CLIENT_ID=seu_client_id_aqui
# TWITCH_CLIENT_SECRET=seu_client_secret_aqui
# GOOGLE_TRANSLATE_API_KEY=sua_chave_google_aqui
```

### 4. Instalação das Dependências
```bash
# Instalar dependências do backend
npm install

# Instalar dependências do frontend
cd client
npm install
cd ..
```

### 5. Executar a Aplicação
```bash
# Executar em modo desenvolvimento (backend + frontend)
npm run dev

# OU executar separadamente:

# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run client
```

### 6. Acessar a Aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

## 📱 Como Usar

### 1. Adicionar Streams
- Digite o nome do streamer na barra de pesquisa (ex: "ninja", "kick.com/streamer")
- O sistema detecta automaticamente se é Twitch ou Kick
- Ou escolha manualmente a plataforma desmarcando "Detectar automaticamente"
- Clique em "Adicionar Stream" ou selecione da lista de resultados
- O stream aparecerá no grid principal com badge da plataforma

### 2. Controle de Áudio
- Use o painel "Controle de Áudio Inteligente"
- Ative/desative o Auto-Focus
- Ajuste volumes master, principal e secundários
- Controle individual de cada stream

### 3. Criar Sala
- Clique em "Criar Sala" no header
- Defina nome e adicione streamers
- Configure permissões (votação, auto-focus, tradução)
- Compartilhe o ID da sala com amigos

### 4. Chat Unificado
- Visualize mensagens de todos os chats
- Ative tradução automática
- Use filtros e configurações
- Envie mensagens na sala (se estiver em uma)

### 5. Streamer+ Analytics
- Acesse via menu "Streamer+"
- Veja rankings por viewers ou atividade
- Analise estatísticas em tempo real
- Compare performance dos streamers

## 🎨 Interface

### Layout Responsivo
- **Desktop**: Grid completo com chat lateral
- **Tablet**: Layout adaptado com controles otimizados  
- **Mobile**: Interface simplificada para telas pequenas

### Tema Dark
- Gradientes modernos roxo/azul
- Efeitos de glass morphism
- Animações suaves
- Indicadores visuais intuitivos

## 🔧 Configurações Avançadas

### Variáveis de Ambiente
```env
# Servidor
PORT=5000
NODE_ENV=development

# Twitch API
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
TWITCH_REDIRECT_URI=http://localhost:3000/auth/callback

# Tradução
GOOGLE_TRANSLATE_API_KEY=your_api_key

# CORS
CORS_ORIGIN=http://localhost:3000

# JWT (para autenticação futura)
JWT_SECRET=your_jwt_secret

# Database (para persistência futura)
DATABASE_URL=your_database_url
```

### Scripts Disponíveis
```bash
# Desenvolvimento
npm run dev          # Backend + Frontend
npm run server       # Apenas backend
npm run client       # Apenas frontend

# Produção
npm run build        # Build do frontend
npm start           # Servidor produção

# Utilitários
npm test            # Testes (quando implementados)
```

## 🚀 Deploy

### Netlify (Frontend)
1. Build: `cd client && npm run build`
2. Deploy pasta: `client/build`
3. Configure variáveis de ambiente

### Heroku (Backend)
1. Configure Procfile: `web: node server/index.js`
2. Adicione variáveis de ambiente
3. Deploy via Git

### Docker (Opcional)
```dockerfile
# Dockerfile exemplo
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📋 Roadmap

### Próximas Funcionalidades
- [ ] Sistema de autenticação completo
- [ ] Persistência de salas e configurações
- [ ] Integração com Discord
- [ ] Modo picture-in-picture
- [ ] Gravação de highlights
- [ ] Sistema de notificações
- [ ] Suporte a YouTube Live
- [ ] App mobile (React Native)
- [ ] Chat da Kick integrado
- [ ] Mais plataformas de streaming

### Melhorias Técnicas
- [ ] Testes automatizados
- [ ] Cache Redis
- [ ] CDN para assets
- [ ] Monitoramento e logs
- [ ] Otimização de performance
- [ ] PWA (Progressive Web App)

## 🐛 Problemas Conhecidos

1. **CORS**: Configure corretamente as origens permitidas
2. **Twitch Embed**: Alguns streams podem ter restrições de embed
3. **Audio Context**: Navegadores podem bloquear autoplay de áudio
4. **WebSocket**: Verifique firewall para conexões Socket.IO

## 📞 Suporte

- **Issues**: Use o GitHub Issues para bugs e sugestões
- **Documentação**: Consulte este README
- **API Twitch**: [Documentação oficial](https://dev.twitch.tv/docs/api/)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com ❤️ por Sergio**

*Multitwitch+ - A próxima geração de plataformas de streaming*
