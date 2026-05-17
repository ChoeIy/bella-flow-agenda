<h1 align="center">
  🌸 Bella Flow
</h1>

<p align="center">
  <strong>Sistema completo para gestão de clínicas de estética</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-ativo-success?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/versão-1.0.0-blue?style=for-the-badge" alt="Versão">
  <img src="https://img.shields.io/badge/licença-MIT-green?style=for-the-badge" alt="Licença">
</p>

<p align="center">
  <a href="#-sobre-o-projeto">Sobre</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-tecnologias-utilizadas">Tecnologias</a> •
  <a href="#-como-rodar-o-projeto">Instalação</a> •
  <a href="#-deploy">Deploy</a> •
  <a href="#-licença">Licença</a>
</p>

---

# 📖 Sobre o projeto

O **Bella Flow** é um sistema completo para gerenciamento de clínicas de estética, desenvolvido para facilitar o controle de clientes, serviços, agenda e faturamento em um único lugar.

O projeto possui uma interface moderna, organizada e intuitiva, focada em produtividade e praticidade para profissionais da área da beleza e estética.

---

# ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 👥 Cadastro de clientes | Cadastro completo com telefone, CEP e endereço |
| 💆‍♀️ Serviços | Gerenciamento de serviços e preços |
| 📅 Agenda | Agendamento de horários e controle de status |
| 💰 Faturamento | Controle financeiro e valores recebidos |
| 📊 Dashboard | Cards e métricas resumidas |
| 📄 Relatórios | Exportação em PDF e CSV |
| 🌙 Tema escuro | Alternância entre dark/light mode |
| 🔐 Login seguro | JWT + criptografia bcrypt |

---

# 🧱 Tecnologias utilizadas

## Frontend
- HTML5
- CSS3
- JavaScript (ES6+)

## Backend
- Node.js
- Express

## Banco de dados
- MySQL

## Segurança
- JWT (jsonwebtoken)
- bcryptjs

## Relatórios
- jsPDF

---

# 📁 Estrutura do projeto

```bash
bella-flow-agenda/
│
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── clients.js
│   │   ├── services.js
│   │   ├── appointments.js
│   │   └── reports.js
│   │
│   ├── .env.example
│   ├── db.js
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── login.html
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── database.sql
└── README.md
```

---

# ⚙️ Como rodar o projeto

## 🖥️ Pré-requisitos

Antes de começar, você precisa ter instalado:

- Node.js 16+
- MySQL Server
- Git (opcional)
- VS Code recomendado

---

# 📥 1. Clone o repositório

```bash
git clone https://github.com/ChoeIy/bella-flow-agenda.git
```

Entre na pasta:

```bash
cd bella-flow-agenda
```

---

# 🗄️ 2. Configure o banco de dados

Execute o arquivo SQL:

```bash
mysql -u root -p < database.sql
```

Isso criará automaticamente todas as tabelas necessárias.

---

# 🔧 3. Configure o backend

Entre na pasta backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo chamado `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=essencia_db
JWT_SECRET=bella_flow_secret_2024
PORT=3000
```

Inicie o servidor:

```bash
npm start
```

✅ Backend rodando em:

```txt
http://localhost:3000
```

---

# 🌐 4. Abrindo o frontend

Abra:

```txt
frontend/login.html
```

Ou utilize a extensão **Live Server** no VS Code.

---

# 🔐 Autenticação

O sistema utiliza:

- JWT para autenticação
- bcryptjs para criptografia de senhas
- Middleware de proteção de rotas

---

# 📊 Relatórios

O sistema permite:

- Exportação em PDF
- Exportação em CSV
- Relatórios de faturamento
- Relatórios de agendamentos

---

# 🌙 Tema escuro

O Bella Flow possui suporte completo a:

- Dark Mode
- Light Mode
- Salvamento automático da preferência do usuário

---

# 🚀 Deploy

Em breve suporte e tutorial para deploy em:

- Railway
- Render
- Vercel

---

# 📄 Licença

Este projeto está sob a licença MIT.

Veja o arquivo `LICENSE` para mais informações.

---

# 🤝 Contribuindo

Contribuições são muito bem-vindas!

## Passos

1. Faça um Fork do projeto

2. Crie uma branch:

```bash
git checkout -b feature/minha-feature
```

3. Faça commit das alterações:

```bash
git commit -m "Adiciona nova feature"
```

4. Faça push para sua branch:

```bash
git push origin feature/minha-feature
```

5. Abra um Pull Request 🚀

---

# 👨‍💻 Autor

<p align="center">
  <a href="https://github.com/ChoeIy">
    <img src="https://img.shields.io/badge/GitHub-ChoeIy-181717?style=for-the-badge&logo=github">
  </a>
</p>

<p align="center">
  Feito com 💖 por <strong>ChoeIy</strong>
</p>
