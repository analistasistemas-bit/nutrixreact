# Troubleshooting — NutixoApp

Problemas comuns e como resolvê-los.

---

## 🔧 Ambiente de Desenvolvimento

### `npm run dev` não inicia

**Sintomas:** Erro de porta em uso ou módulo não encontrado.

```bash
# Verificar se a porta 5173 já está em uso
lsof -i :5173

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### Backend Python não inicia

**Sintomas:** `ModuleNotFoundError` ou `uvicorn not found`.

```bash
# Confirmar que está no venv correto
cd backend-python
source venv/bin/activate

# Verificar se o venv está ativo
which python  # deve apontar para venv/bin/python

# Reinstalar dependências
pip install -r requirements.txt

# Rodar com log detalhado
uvicorn app.main:app --reload --port 8001 --log-level debug
```

---

### Variáveis de ambiente não carregam

**Sintomas:** `VITE_SUPABASE_URL is undefined` ou API retorna 401.

1. Confirmar que o arquivo `.env` existe na **raiz** do projeto (não em `/src`).
2. Todas as variáveis para o Vite **devem começar com `VITE_`**.
3. Após alterar o `.env`, **reiniciar** o `npm run dev` (Vite não faz hot-reload de `.env`).

```bash
# Verificar se o arquivo existe e tem conteúdo
cat .env | grep VITE_SUPABASE
```

---

## 🔐 Autenticação

### Login não funciona — "Invalid credentials"

1. Confirmar que o e-mail está cadastrado no Supabase Auth.
2. Verificar que `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env` correspondem ao projeto correto.
3. No Supabase Dashboard → Authentication → Users, verificar se o usuário existe e o e-mail foi confirmado.

---

### Sessão expira inesperadamente

O token JWT dura 1 hora. O SDK do Supabase renova automaticamente via refresh token. Se a renovação falhar:

```
Causa: refresh token expirado (7 dias de inatividade) ou chave rotacionada no Supabase.
Solução: Fazer logout e login novamente.
```

---

### "Row Level Security" bloqueando acesso

**Sintomas:** Dados retornam vazio ou erro 403 mesmo estando logado.

1. Confirmar que o usuário está autenticado (AuthContext não é null).
2. No Supabase Dashboard → Table Editor → selecionar tabela → RLS Policies, verificar se a policy `user_email = auth.email()` existe.
3. Verificar se o `user_email` no banco corresponde exatamente ao e-mail da sessão.

---

## 📄 Importação de Exames

### PDF não processa — fica em "Processando..."

**Causas possíveis:**

1. **Backend Python offline:** Verificar se `http://localhost:8001/health` responde.
2. **NVIDIA API Key inválida:** Verificar no arquivo `.env.backend` e testar a chave em [build.nvidia.com](https://build.nvidia.com).
3. **PDF corrompido ou com senha:** Testar abrir o PDF manualmente.
4. **Timeout:** PDFs muito longos (> 20 páginas) podem ultrapassar o timeout.

```bash
# Testar se o backend está respondendo
curl http://localhost:8001/health

# Ver logs do backend em tempo real
uvicorn app.main:app --reload --port 8001 --log-level debug
```

---

### PDF processa mas biomarcadores ficam errados ou incompletos

**Causa:** O LLM pode ter dificuldade com layouts complexos de laboratórios.

**Soluções:**
1. Usar um PDF de melhor qualidade (escaneado em 300 DPI mínimo).
2. Verificar se `BACKEND_DOCLING_OCR=true` no `.env.backend`.
3. Para PDFs escaneados com baixa qualidade, o Docling pode precisar do OCR engine opcional (`easyocr`). Consulte `backend-python/README.md`.

---

### Valores de exames aparecem com separador errado

**Sintomas:** `278.000` aparece como `278` ou vírgulas sendo ignoradas.

**Causa:** `parseFloat()` usado diretamente em vez de `parsePtBrNumber()`.

**Onde está o bug:** Procure por `parseFloat(` nos arquivos de pages/services e substitua por `parsePtBrNumber()` de `src/lib/numberLocale.js`.

---

## 🍽️ Diário Alimentar

### Reconhecimento de voz não funciona

**Causa:** A Web Speech API só funciona em navegadores baseados em Chromium (Chrome, Edge) e Safari.

- Firefox **não suporta** a Web Speech API.
- Em mobile, verificar permissão de microfone nas configurações do navegador.

---

### Foto de refeição não analisa

1. Verificar se `VITE_GEMINI_API_KEY` está configurada no `.env`.
2. Testar a chave no [Google AI Studio](https://aistudio.google.com).
3. Confirmar que a imagem tem menos de 4MB (limite do Gemini Vision).

---

## 📊 Dashboard / Progress

### Gráficos não aparecem

**Causa:** Dados insuficientes — o gráfico precisa de ao menos 1 registro.

1. Fazer upload de pelo menos um exame ou registrar uma medida.
2. Verificar no Supabase Dashboard → Table Editor se os dados estão salvos na tabela correta.

---

### Seletor de período não filtra corretamente

**Causa:** Datas no banco podem estar em UTC enquanto o filtro usa horário local.

O filtro usa `new Date(e.created_at) >= cutoff` — o Supabase armazena em UTC. Em fusos com diferença grande, registros de hoje podem aparecer como "ontem".

**Workaround temporário:** Usar o período "30D" que cobre a variação de fuso.

---

## 🎮 Gamificação

### XP não atualiza após ação

1. Verificar se `VITE_ENABLE_GAMIFICATION=true` no `.env`.
2. Abrir o console do navegador e procurar por erros na chamada `addXP()`.
3. Verificar no Supabase → `nutrixo_profiles` se o usuário tem um registro (pode ser necessário criar manualmente se for conta nova).

---

### Level-up modal não aparece

**Causa:** O level-up é verificado em `GamificationContext.jsx` após `addXP()`. Se o contexto não está inicializado:

1. Verificar se o usuário está logado (sem auth, o contexto não carrega).
2. Fazer reload da página após login.

---

## 🌙 Dark / Light Mode

### Tema não persiste após reload

**Causa:** `localStorage` foi limpo ou bloqueado pelo navegador.

1. Verificar no DevTools → Application → Local Storage → `theme` key.
2. Em modo privado/anônimo, o localStorage não persiste entre sessões.

---

### Elementos brancos sobre fundo branco (light mode)

**Causa:** Componente usando `dark:bg-slate-*` hardcoded em vez dos tokens CSS.

Reportar o componente afetado e substituir pelas classes corretas — veja `docs/DESIGN_SYSTEM.md`.

---

## 🛠️ Build e Deploy

### Build falha com `VITE_* is not defined`

Em produção (Vercel), todas as variáveis `VITE_*` devem estar configuradas em **Settings → Environment Variables**. Variáveis ausentes causam erro de build.

```bash
# Testar o build localmente antes do deploy
npm run build
npm run preview
```

---

### PWA não atualiza após novo deploy

**Causa:** Service Worker cacheou a versão antiga.

**Para o usuário:** Abrir o app → aguardar o toast "Nova versão disponível" → clicar "Atualizar".

**Para forçar:** Abrir DevTools → Application → Service Workers → "Unregister" → Recarregar.

---

### Backend Python retorna 502 em produção (nginx)

1. Verificar se o serviço está rodando: `sudo systemctl status nutrixo-backend`
2. Ver logs: `sudo journalctl -u nutrixo-backend -f`
3. Confirmar que o nginx está configurado para proxiar para a porta correta (`proxy_pass http://127.0.0.1:8001`).

```bash
# Reiniciar o serviço
sudo systemctl restart nutrixo-backend
```

---

## 📞 Suporte

Se o problema não está listado aqui:

1. Verifique os logs do console do navegador (F12 → Console).
2. Verifique os logs do backend Python.
3. Abra uma issue no repositório com: **descrição do problema + logs + passos para reproduzir**.

Para vulnerabilidades de segurança, veja `docs/SECURITY.md`.

---

*Atualizado em: 20 de Fevereiro de 2026*
