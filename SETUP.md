# VMF AutoStore — Guia de Setup

## 1. Neon Database (banco de dados)

1. Acesse https://neon.tech e crie uma conta gratuita
2. Crie um novo projeto chamado "vmf-autostore" (região: South America - São Paulo)
3. No painel do projeto, copie a **Connection String** (algo como `postgresql://user:pass@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require`)
4. Vá em **SQL Editor** e cole o conteúdo do arquivo `schema.sql` — execute para criar as tabelas
5. Cole a Connection String no `.env.local` como `DATABASE_URL`

## 2. Cloudinary (fotos dos carros)

1. Acesse https://cloudinary.com e crie uma conta gratuita
2. No Dashboard, copie:
   - **Cloud Name**
   - **API Key**
   - **API Secret** (clique em "Reveal" para ver)
3. Cole no `.env.local`

## 3. Configurar .env.local

Abra o arquivo `.env.local` e preencha:

```env
DATABASE_URL="postgresql://..."        # do Neon
ADMIN_PASSWORD="sua_senha_aqui"        # qualquer senha que você quiser
ADMIN_TOKEN="2e2a95f3a8c3a5565da77d9dc52f0478ba3e47bbf80b73584159598921477b2f"  # já gerado!
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"
```

> O `ADMIN_TOKEN` já foi gerado. Não precisa mudar.

## 4. Rodar localmente

```bash
# Abrir terminal no VS Code na pasta vmf-autostore
npm run dev
```

Acesse:
- **Site público:** http://localhost:3000
- **Admin:** http://localhost:3000/admin (redireciona para /login)

## 5. Deploy na Vercel (para deixar no ar)

1. Crie conta em https://vercel.com
2. Instale a CLI: `npm install -g vercel`
3. Na pasta do projeto: `vercel`
4. Adicione as variáveis de ambiente no painel da Vercel (Settings > Environment Variables)

---

## Funcionalidades

### Site Público
- Catálogo de carros com filtros (marca, preço, busca)
- Página de detalhe com galeria de fotos e lightbox
- Botão WhatsApp com mensagem pré-preenchida

### Painel Admin (senha protegida)
- **Dashboard:** stats de estoque, leads ativos, vendas e margem do mês
- **Estoque:** listar, adicionar, editar e excluir carros + upload de fotos
- **Leads:** Kanban com 5 colunas — arraste e solte para mover entre etapas
- **Vendas:** registrar vendas, ver histórico e margem de lucro
