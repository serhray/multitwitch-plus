# 📊 Google AdSense Setup Guide

## **Resolvendo o Erro de Verificação**

### **Problema Atual**
O erro "Não foi possível verificar seu site" indica que o AdSense não consegue acessar seu site. Para resolver:

### **1. Deploy Necessário**
- **Problema**: Site está rodando apenas localmente (localhost:3000)
- **Solução**: Deploy em domínio público (Netlify, Vercel, etc.)
- **Requisito**: HTTPS obrigatório para AdSense

### **2. Passos para Resolver**

#### **A. Deploy Imediato**
```bash
# Build do projeto
npm run build

# Deploy no Netlify/Vercel
# Ou configure domínio próprio
```

#### **B. Configurar Domínio**
- Registrar domínio próprio
- Configurar DNS
- Certificado SSL automático

#### **C. Atualizar AdSense**
- Adicionar novo site com domínio público
- Aguardar verificação (24-48h)
- Configurar unidades de anúncio

## **Configuração Técnica**

### **1. Variáveis de Ambiente**
Substitua no `.env`:

```env
# Google AdSense - SUBSTITUIR pelos seus IDs reais
REACT_APP_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXXX
REACT_APP_ADSENSE_BANNER_SLOT=1234567890
REACT_APP_ADSENSE_SIDEBAR_SLOT=0987654321
REACT_APP_ENABLE_ADS=true
```

### **2. Obter IDs do AdSense**
1. **Client ID**: Painel AdSense → Sites → Seu site → Código AdSense
2. **Ad Slots**: Anúncios → Por unidade de anúncio → Criar

### **3. Posicionamento dos Anúncios**

#### **Banner Superior** (728x90)
- Localização: Acima das streams
- Formato: Horizontal/Responsivo
- Slot: `REACT_APP_ADSENSE_BANNER_SLOT`

#### **Sidebar** (300x250)
- Localização: Lado do chat
- Formato: Retângulo médio
- Slot: `REACT_APP_ADSENSE_SIDEBAR_SLOT`

## **Componentes Criados**

### **AdBanner.js**
- Banner responsivo para topo/rodapé
- Auto-hide para usuários premium
- Lazy loading para performance

### **AdSidebar.js**
- Anúncio lateral 300x250
- Integrado na seção de chat
- Placeholder quando AdSense não configurado

## **Estimativa de Revenue**

### **Cenário Base**
- **1,000 usuários/dia** × **2 page views** × **$1.50 CPM** = **$90/mês**
- **Gaming audience** = CPM mais alto ($2-4)
- **Tempo de sessão** alto = mais impressões

### **Otimizações**
- **A/B test** posicionamento
- **Responsive ads** para mobile
- **Ad refresh** em sessões longas
- **Premium tier** sem ads

## **Próximos Passos**

1. **Deploy** em domínio próprio
2. **Aplicar** para AdSense
3. **Configurar** variáveis de ambiente
4. **Testar** posicionamento de ads
5. **Implementar** modo premium sem ads

## **Compliance**

### **Políticas AdSense**
- ✅ Conteúdo original (nossa plataforma)
- ⚠️ Conteúdo de terceiros (streams Twitch)
- ✅ Navegação clara
- ✅ Política de privacidade

### **Twitch ToS**
- Verificar compatibilidade
- Não interferir com player Twitch
- Respeitar direitos dos streamers
