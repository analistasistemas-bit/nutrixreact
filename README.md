# 🧪 NutixoApp: Sua Jornada de Saúde Inteligente

![Versão](https://img.shields.io/badge/vers%C3%A3o-1.1.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange?style=for-the-badge)
![Framework](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Build](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite)

O **NutixoApp** é uma plataforma de saúde de próxima geração que combina inteligência artificial com gamificação para transformar o acompanhamento de exames e hábitos alimentares em uma experiência envolvente.

---

## ✨ Funcionalidades Principais

- 🔬 **Importação via IA**: Basta subir seu PDF de exames e nossa IA extrai todos os biomarcadores automaticamente.
- 🎮 **Gamificação Sentinel**: Ganhe XP, suba de nível e cuide do seu Pet virtual mantendo hábitos saudáveis.
- 📊 **Dashboard de Progresso**: Visualize sua evolução histórica com cards interativos e gráficos dinâmicos.
- 🍎 **Plano Nutricional**: Integração direta entre seus dados de saúde e sugestões de alimentação.

---

## 🚀 Guia Rápido

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/analistasistemas-bit/nutrixreact.git

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Backend Python (importação Docling)
```bash
cd backend-python
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.backend.example .env.backend
uvicorn app.main:app --reload --port 8001
```

Com `VITE_IMPORT_USE_BACKEND=true`, os menus Exames/Medidas/Plano enviam PDF/imagem para o backend, que faz:
1. extração com Docling -> markdown limpo
2. extração estruturada com LLM
3. persistência no Supabase (quando `SUPABASE_SERVICE_ROLE_KEY` estiver configurada)

---

## 🏗️ Exploração Técnica

Para entender mais sobre o projeto, consulte nossa documentação interna:

- 🏗️ **[Arquitetura do Projeto](./docs/ARCHITECTURE.md)**: Stack e estrutura de pastas.
- 🎨 **[Design System](./docs/DESIGN_SYSTEM.md)**: Cores, fontes e componentes premium.
- 🌿 **[Como Contribuir](./docs/CONTRIBUTING.md)**: Padrões de código e commits.
- 🛡️ **[Segurança](./docs/SECURITY.md)**: Política de reporte de vulnerabilidades.

---

## 🛠️ Tecnologias Utilizadas
- **Frontend**: React 19, Framer Motion.
- **Estilo**: Tailwind CSS 4.
- **Ícones**: Lucide React.
- **Backend/IA**: Integração via @insforge/sdk.

---
*NutixoApp - Elevando sua saúde através da inteligência.*
