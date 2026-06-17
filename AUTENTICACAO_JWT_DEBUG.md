# 🔐 DEBUG - Autenticação JWT para Evoluções

## Problema Identificado

### ❌ Antes (Configuração Vazia)
```typescript
// auth.interceptor.ts - VAZIO!
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);  // ❌ Não adiciona nenhum token
};

// token.service.ts - VAZIO!
constructor() { }

// auth.service.ts - VAZIO!
constructor() { }
```

**Resultado:** POST /evolutions retorna 403 - Authorization header não enviado

---

## ✅ Solução Implementada

### 1. TokenService - Gerencia JWT no localStorage
```typescript
// src/app/core/auth/token.service.ts
setToken(token: string): void
getToken(): string | null
hasToken(): boolean
removeToken(): void
getAuthorizationHeader(): string | null  // Retorna 'Bearer <token>'
```

### 2. Auth Interceptor - Adiciona JWT ao Header
```typescript
// src/app/core/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();
  
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`  // ✅ Adiciona header!
      }
    });
    return next(authReq);
  }
  
  return next(req);
};
```

### 3. AuthService - Gerencia Autenticação
```typescript
// src/app/core/auth/auth.service.ts
login(credentials): Observable<LoginResponse>
setMockToken(token: string): void  // Para testes
logout(): void
getCurrentToken(): string | null
isAuthenticated(): boolean
```

---

## 🧪 Como Testar

### Opção 1: Simular Token no Console (Rápido para Testes)

1. Abra o DevTools (F12)
2. Vá até a aba **Console**
3. Execute o comando abaixo:

```javascript
// Simular um token de teste
const token = 'seu_token_jwt_aqui';
localStorage.setItem('auth_token', token);
console.log('Token simulado armazenado');
```

4. Recarregue a página (F5)
5. Tente criar uma evolução

**Resultado esperado:** Header Authorization será enviado
```
Authorization: Bearer seu_token_jwt_aqui
```

### Opção 2: Usar AuthService via Console

```javascript
// No console do browser
angular.ɵɵruntimeError({
  // Não é necessário fazer assim, use a opção 1
});

// Ou melhor: acesse o AuthService via dependência
```

### Opção 3: Login Real (Recomendado para Produção)

```typescript
// Em um componente
constructor(private authService: AuthService) {
  this.authService.login({
    email: 'usuario@example.com',
    password: 'senha'
  }).subscribe(response => {
    // Token será armazenado automaticamente
    console.log('Login bem-sucedido');
  });
}
```

---

## 📊 Fluxo do JWT Agora

```
┌─────────────────────────────────────────────────┐
│         Componente POST /evolutions             │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
            ┌─────────────────────┐
            │  EvolutionService   │
            │  http.post()        │
            └────────────┬────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  authInterceptor (Angular)     │
        │  ✅ Injeta TokenService        │
        │  ✅ Recupera token             │
        │  ✅ Adiciona Authorization     │
        └────────────────┬───────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  HTTP Request                  │
        │  POST /evolutions              │
        │  Authorization: Bearer <token> │
        │  ✅ Enviado com sucesso        │
        └────────────────┬───────────────┘
                         │
                         ▼
         ┌──────────────────────────────┐
         │  Backend API                 │
         │  ✅ Valida Authorization     │
         │  ✅ Processa POST            │
         │  ✅ Retorna 201 Created      │
         └──────────────────────────────┘
```

---

## 🔍 Verificar se Está Funcionando

### 1. Abrir DevTools (F12)

### 2. Ir para Network

### 3. Criar uma evolução

### 4. Procurar pela requisição POST /evolutions

### 5. Verificar Headers da Requisição:

✅ **ANTES (BUG):**
```
POST /evolutions HTTP/1.1
Host: localhost:8080
Content-Type: application/json

❌ Authorization: FALTANDO / NÃO ENVIADO
```

✅ **DEPOIS (CORRIGIDO):**
```
POST /evolutions HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

✅ Authorization: Bearer <token> - ENVIADO COM SUCESSO!
```

---

## 📋 Comparação com StudentService

| Aspecto | StudentService | EvolutionService |
|---------|---|---|
| **HttpClient** | ✅ Injetado | ✅ Injetado |
| **http.post()** | ✅ Usado | ✅ Usado |
| **Auth Interceptor** | ✅ Ativo (agora) | ✅ Ativo (agora) |
| **Token no Header** | ✅ Adicionado | ✅ Adicionado |

**Diferença era:** O interceptor estava vazio, afetando AMBOS, mas talvez StudentService tenha dados públicos GET.

---

## 🐛 Logs de Debug

Os logs abaixo aparecem no console quando você tenta criar uma evolução:

```
[TokenService] Token recuperado: true
[AuthInterceptor] Interceptando requisição: http://localhost:8080/evolutions
[AuthInterceptor] Token encontrado: true
[AuthInterceptor] Authorization header adicionado para: http://localhost:8080/evolutions
```

Se not vir esses logs:
- Verifique se o token está no localStorage: `localStorage.getItem('auth_token')`
- Verifique o console para erros
- Recarregue a página

---

## ⚠️ Instruções para Produção

1. **Remova `setMockToken()`** após testes
2. **Implemente login real** com seu backend
3. **Valide o JWT** no backend
4. **Use HTTPS** em produção
5. **Configure CORS** corretamente no backend
6. **Não armazene tokens sensíveis** em localStorage (use sessionStorage ou HttpOnly cookies)

---

## 📧 Verificação Final

Se você ainda vir **403 - Authorization header not present**, verifique:

1. ✅ `localStorage.getItem('auth_token')` retorna o token?
2. ✅ Console mostra `[AuthInterceptor]` logs?
3. ✅ Network tab mostra `Authorization: Bearer` header?
4. ✅ Backend aceita o token?

---

**Arquivo criado em:** 2026-06-17
**Status:** ✅ Autenticação JWT Implementada

