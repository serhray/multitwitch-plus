# 🔧 Solução de Problemas - Brave Browser

## 🚨 Problema: Login não funciona no Brave

O Brave Browser tem configurações de privacidade mais rigorosas que podem bloquear cookies e requisições. Aqui estão as soluções:

## ✅ Soluções Implementadas

### 1. **Configurações CORS Atualizadas**
- Adicionado suporte para `127.0.0.1:3000`
- Headers adicionais permitidos
- Logs de debug para identificar origens bloqueadas

### 2. **Cookies Compatíveis com Brave**
- `sameSite: 'lax'` em desenvolvimento (mais permissivo)
- `secure: false` em desenvolvimento (permite HTTP)
- Fallback para localStorage se cookies falharem

### 3. **Componente de Debug**
- Painel de debug no canto superior direito
- Testes de cookies e localStorage
- Logs detalhados para diagnóstico

## 🔧 Como Testar

### **Passo 1: Verificar Configurações do Brave**

1. **Desabilitar Shields temporariamente**:
   - Clique no ícone do leão (Shields) na barra de endereços
   - Selecione "Shields down" para o site
   - Recarregue a página

2. **Verificar configurações de cookies**:
   - Vá em `brave://settings/content/cookies`
   - Certifique-se que "Allow all cookies" está ativado
   - Ou adicione `localhost` às exceções

3. **Verificar configurações de site**:
   - Vá em `brave://settings/content/siteSettings`
   - Procure por `localhost:3000`
   - Permita cookies e JavaScript

### **Passo 2: Usar o Componente de Debug**

1. **Abrir o painel de debug**:
   - O painel aparece no canto superior direito
   - Clique em "Verificar Cookies"

2. **Testar cookies**:
   - Clique em "Definir Cookie Teste"
   - Clique em "Verificar Cookie Teste"
   - Verifique se os cookies estão sendo definidos

3. **Testar localStorage**:
   - Clique em "Testar localStorage"
   - Verifique se funciona como fallback

### **Passo 3: Verificar Console do Navegador**

1. **Abrir DevTools** (F12)
2. **Verificar Console**:
   - Procure por erros de CORS
   - Procure por erros de cookies
   - Verifique logs de debug

3. **Verificar Network**:
   - Vá na aba Network
   - Tente fazer login
   - Verifique se as requisições estão sendo feitas
   - Verifique se cookies estão sendo enviados

## 🛠️ Soluções Manuais

### **Se cookies não funcionarem**:

1. **Usar localStorage como fallback**:
   ```javascript
   // O sistema já tem fallback automático
   // Se cookies falharem, usa localStorage
   ```

2. **Configurar exceções no Brave**:
   - Vá em `brave://settings/content/cookies`
   - Adicione `http://localhost:3000` às exceções
   - Adicione `http://127.0.0.1:3000` às exceções

3. **Desabilitar proteções temporariamente**:
   - Shields down para o domínio
   - Permitir todos os cookies
   - Permitir JavaScript

### **Se CORS bloquear**:

1. **Verificar origem**:
   - Use `http://localhost:3000` (não `127.0.0.1`)
   - Ou adicione `127.0.0.1:3000` às configurações

2. **Verificar headers**:
   - O servidor já permite headers necessários
   - Verifique se `credentials: 'include'` está sendo enviado

## 📋 Checklist de Diagnóstico

### **✅ Funcionando**:
- [ ] Cookies são definidos (verificar DevTools > Application > Cookies)
- [ ] Requisições são feitas (verificar Network tab)
- [ ] Login redireciona corretamente
- [ ] Usuário permanece logado após recarregar

### **❌ Problemas Comuns**:
- [ ] Cookies não são definidos
- [ ] Requisições são bloqueadas por CORS
- [ ] Login redireciona mas não mantém sessão
- [ ] Shields do Brave bloqueando requisições

## 🔍 Logs de Debug

### **No Console do Navegador**:
```javascript
// Verificar se cookies estão funcionando
console.log('Auth Token:', getAuthToken());
console.log('localStorage Token:', localStorage.getItem('auth_token'));
```

### **No Servidor**:
```javascript
// Logs de CORS
console.log('CORS blocked origin:', origin);

// Logs de cookies
console.log('Cookies recebidos:', req.cookies);
```

## 🚀 Solução Rápida

Se nada funcionar, use esta configuração temporária no Brave:

1. **Shields Down** para `localhost:3000`
2. **Permitir todos os cookies**
3. **Permitir JavaScript**
4. **Limpar cache e cookies**
5. **Recarregar página**

## 📞 Suporte

Se o problema persistir:

1. **Capturar logs** do componente de debug
2. **Capturar erros** do console do navegador
3. **Verificar** configurações do Brave
4. **Testar** em modo incógnito
5. **Comparar** com outros navegadores (Chrome, Firefox)

## 🔄 Próximos Passos

Após resolver o problema:

1. **Remover componente de debug** do App.js
2. **Limpar logs de debug** do código
3. **Otimizar configurações** para produção
4. **Documentar** soluções encontradas
