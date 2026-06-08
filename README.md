<div align="center">
  <h1>🎙️ Voice2Calendar</h1>
  <p><strong>Automação de Tarefas e Eventos via Áudio</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Google Gemini" />
    <img src="https://img.shields.io/badge/Google_Calendar-4285F4?style=for-the-badge&logo=google-calendar&logoColor=white" alt="Google Calendar API" />
    <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

---

## 📌 Visão Geral

O **Voice2Calendar** é um aplicativo voltado para produtividade pessoal que elimina a fricção de criar eventos e tarefas manualmente. Através de uma interface web minimalista (PWA), você simplesmente grava um áudio (ex: _"Lembrar de pagar o boleto da internet amanhã às 10h"_) e o sistema cuida do resto.

O aplicativo processa o áudio, transcreve, extrai as informações estruturadas (título, data, hora, tipo) usando Inteligência Artificial e agenda automaticamente no seu **Google Calendar** ou **Google Tasks**.

## ✨ Funcionalidades

- **🎙️ Gravação de Áudio Integrada:** Capture suas tarefas de forma rápida e natural.
- **🧠 IA com Google Gemini:** Processamento de linguagem natural para entender intenções complexas e extrair dados de eventos.
- **📅 Integração com Google:** Adição automática de eventos ao _Google Calendar_ e _Google Tasks_.
- **📱 Progressive Web App (PWA):** Instale direto no seu celular para uma experiência de app nativa.
- **🎨 Design Moderno:** Construído com Tailwind CSS para uma interface rápida e responsiva.

## 🏗️ Arquitetura e Tecnologias

O projeto foi construído para ser moderno, rápido e fácil de hospedar de forma _serverless_:

- **Framework:** Next.js 16 (App Router)
- **Estilização:** Tailwind CSS v4
- **Inteligência Artificial:** Google Gen AI (`@google/genai`)
- **Integração Google:** Google APIs (`googleapis`)
- **PWA:** Serwist (`@serwist/next`)

## 🚀 Como Rodar Localmente

1. **Clone o repositório:**

```bash
git clone https://github.com/Pedro-Lucas-Maia/voice-to-calendar.git
cd voice-to-calendar
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configuração de Ambiente:**
   Crie um arquivo `.env.local` na raiz do projeto e adicione suas variáveis de ambiente:

```env
GEMINI_API_KEY=sua_chave_gemini
# Outras variáveis necessárias para o OAuth do Google
```

4. **Inicie o servidor de desenvolvimento:**

```bash
npm run dev
```

5. Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma _issue_ ou enviar um _Pull Request_.

---

<div align="center">
  Feito com ❤️
</div>
