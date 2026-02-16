# Guia de Implantação (Deployment) - NutixoApp

Este guia descreve como colocar o NutixoApp no ar utilizando a infraestrutura do InsForge.

## 🚀 Deployment via MCP Tool

O NutixoApp está pronto para ser implantado diretamente via ferramenta de automação.

### Parâmetros Necessários
Para realizar o deploy, utilize a ferramenta `create-deployment` com as seguintes configurações:

```json
{
  "sourceDirectory": "/Users/diego/Desktop/IA/ProjetoNutixoApp",
  "projectSettings": {
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "installCommand": "npm install"
  },
  "envVars": [
    { "key": "VITE_INSFORGE_BASE_URL", "value": "SUA_URL_AQUI" },
    { "key": "VITE_INSFORGE_ANON_KEY", "value": "SUA_ANON_KEY_AQUI" }
  ]
}
```

### Verificação de Status
Após iniciar o deploy, você pode verificar o progresso rodando:
```sql
SELECT status, url FROM system.deployments ORDER BY created_at DESC LIMIT 1;
```

## 🛠️ Configuração de SPA
Como este é um app React, o roteamento é gerenciado no lado do cliente. Caso utilize Vercel ou similar, verifique se o arquivo `vercel.json` está presente na raiz com as regras de rewrite:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---
*Para suporte técnico, consulte o time de infraestrutura.*
