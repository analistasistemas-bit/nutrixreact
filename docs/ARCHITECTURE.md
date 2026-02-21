# Arquitetura Técnica — NutrixoApp

Este documento descreve a organização técnica, stack e padrões de implementação do NutixoApp.

---

## 🚀 Stack Tecnológica

### Frontend
| Tecnologia | Versão | Uso |
| :--- | :--- | :--- |
| React | 19.x | UI e gerenciamento de estado local |
| Vite | 7.x | Build tool e dev server |
| Tailwind CSS | 4.x | Estilização com `@theme` (tokens CSS nativos) |
| Framer Motion | 12.x | Animações declarativas |
| Lucide React | 0.562+ | Iconografia SVG |
| React Router | 7.x | Roteamento SPA |
| Supabase JS | 2.x | Auth e database client |
| Google GenAI | 1.42+ | Integração Gemini (análise de imagens) |
| Zod | 4.x | Validação de schemas |

### Backend (Python)
| Tecnologia | Uso |
| :--- | :--- |
| FastAPI | Framework web assíncrono |
| Docling | Extração de texto de PDFs (OCR + estruturação) |
| Meta Llama 3.2 (via NVIDIA API) | Extração estruturada de dados clínicos |
| Supabase (service role) | Persistência e Storage de arquivos |
| uvicorn | ASGI server |

### Infraestrutura
| Componente | Serviço |
| :--- | :--- |
| Frontend | Vercel (CDN global, Edge Network) |
| Backend Python | VPS Linux (nginx + systemd) |
| Banco de Dados | Supabase (PostgreSQL + RLS) |
| Storage | Supabase Storage (PDFs, imagens) |
| PWA | `vite-plugin-pwa` (Service Worker + Manifest) |

---

## 📂 Estrutura de Pastas

```
ProjetoNutixoApp/
├── src/
│   ├── components/
│   │   ├── common/          # LoadingSpinner, EmptyState, Badge, SectionHeader
│   │   ├── gamification/    # XPBar, LevelUpModal, PetWidget, DailyChallenges, AchievementToast
│   │   ├── Header.jsx
│   │   ├── Login.jsx
│   │   ├── Chatbot.jsx
│   │   ├── BiomarkerDetailDrawer.jsx
│   │   └── ReloadPrompt.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx          # Sessão Supabase
│   │   ├── ThemeContext.jsx         # Dark/Light mode
│   │   └── GamificationContext.jsx  # XP, nível, conquistas, pet
│   ├── data/mocks/          # Dados simulados para desenvolvimento
│   ├── hooks/               # Custom hooks (useGamification, useTheme, etc.)
│   ├── layouts/             # MainLayout (sidebar + BottomNav)
│   ├── lib/
│   │   ├── animations.js    # Constantes Framer Motion centralizadas
│   │   ├── numberLocale.js  # Parsing/formatação numérica pt-BR
│   │   └── supabaseClient.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Labs.jsx         # Exames laboratoriais
│   │   ├── Measurements.jsx # Medidas corporais
│   │   ├── Progress.jsx     # Hub de progresso (biomarcadores + físico)
│   │   ├── Food.jsx         # Diário alimentar
│   │   ├── NutritionPlan.jsx
│   │   ├── GamerProfile.jsx
│   │   ├── AccountProfile.jsx
│   │   └── AccountSettings.jsx
│   ├── services/
│   │   └── aiService.js     # Centraliza todas as chamadas de IA e banco
│   └── utils/
├── backend-python/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models.py
│   │   └── services/
│   │       ├── docling_service.py         # PDF → Markdown
│   │       ├── deterministic_extractor.py # Parsing estruturado
│   │       ├── llm_service.py             # IA extração clínica
│   │       ├── jobs.py                    # Fila assíncrona de jobs
│   │       └── supabase_service.py        # Persistência
│   ├── .env.backend.example
│   └── requirements.txt
├── docs/                    # Documentação completa do projeto
├── public/                  # Assets estáticos, ícones PWA
└── vite.config.js
```

---

## ⚙️ Fluxos Principais

### 1. Importação de Exames (Labs / Measurements)

```
Usuário faz upload do PDF
    → Frontend envia para Backend Python (/py-api/import/exams)
    → Docling extrai texto e estrutura o PDF em Markdown
    → LLM (Llama 3.2) interpreta o Markdown e extrai biomarcadores
    → Job assíncrono salva resultado no Supabase (nutrixo_exams + nutrixo_biomarkers)
    → Frontend faz polling do status do job até completar
    → Resultado é exibido com gráficos e análise
```

### 2. Análise de Alimentação (Food)

```
Usuário tira foto / dita por voz / descreve manualmente
    → Frontend chama IA (Gemini Vision para fotos, NVIDIA para texto)
    → IA retorna JSON com calorias, proteínas, carboidratos, gorduras
    → Frontend salva em nutrixo_meals via Supabase JS
    → Histórico e barra de macros são atualizados em tempo real
```

### 3. Sistema de Gamificação

```
Ação do usuário (ex: LOG_MEAL, UPLOAD_EXAM)
    → useGamification hook chama addXP(action)
    → GamificationContext calcula novo XP e verifica level-up
    → Se level-up: dispara LevelUpModal com confetti
    → XP é sincronizado com Supabase (nutrixo_profiles.xp)
    → Pet Sentinel muda de estado conforme humor (calculado por hábitos)
```

### 4. Chat IA (Chatbot)

```
Usuário envia mensagem
    → Chatbot.jsx busca contexto (último exame, refeições de hoje)
    → chatWithAssistant() chama API com histórico de mensagens + contexto
    → Resposta é streamada via Server-Sent Events
    → Texto exibido progressivamente com cursor piscante
```

---

## 🔢 Padrão Numérico Oficial (pt-BR)

**Regra crítica de segurança clínica**: parsing numérico de exames deve usar `src/lib/numberLocale.js`, nunca `parseFloat()` direto.

| Separador | Símbolo | Exemplo |
| :--- | :--- | :--- |
| Milhar | `.` (ponto) | `278.000` = 278 mil |
| Decimal | `,` (vírgula) | `5,4` = 5.4 |

**Funções disponíveis:**
- `parsePtBrNumber(value)` → number
- `formatPtBrNumber(value)` → string formatada
- `parsePtBrReferenceRange(refText)` → `[min, max]`

**Arquivos que usam o padrão:** `aiService.js`, `Progress.jsx`, `Labs.jsx`, `Measurements.jsx`

---

## 🎨 Design System

As diretrizes completas de cores, border radius, z-index, animações e componentes estão em:
👉 [`docs/DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)

---

## 🔐 Segurança

Veja [`docs/SECURITY.md`](./SECURITY.md) e [`docs/SECURITY_AUDIT.md`](./SECURITY_AUDIT.md).

---

*Atualizado em: 20 de Fevereiro de 2026*
