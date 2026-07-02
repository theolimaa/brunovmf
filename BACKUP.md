# Política de Backup e Retenção

## Lixeira (soft delete)

Excluir um carro, cliente ou venda no admin não apaga na hora — move para a lixeira
(`/admin/lixeira`). De lá dá pra restaurar ou apagar em definitivo a qualquer momento.

Depois de **30 dias** na lixeira, um job automático (`/api/cron/purge-trash`, disparado
pelo Vercel Cron todo dia às 6h UTC — ver `vercel.json`) apaga em definitivo o que
sobrou, inclusive as fotos no Cloudinary dos carros purgados. Isso existe pra:

1. Dar uma segunda chance em caso de exclusão por engano.
2. Evitar que fotos de carros excluídos fiquem acumulando pra sempre no Cloudinary.

Pra mudar o prazo de 30 dias, edite `RETENTION_DAYS` em `src/lib/trashConfig.ts`.

**Configuração necessária na Vercel:** adicionar a env var `CRON_SECRET` (qualquer string
aleatória) nas configurações do projeto — a Vercel usa ela automaticamente pra autenticar
a chamada do cron. Sem isso o endpoint funciona mas fica sem essa camada extra de proteção.

## Banco de dados (Neon)

O plano gratuito do Neon tem retenção de restauração point-in-time (PITR) curta — verifique
em Neon Console → o projeto → Settings → Backup/Restore qual é o período atual. Isso é a
rede de segurança pra além da lixeira: cobre casos que a lixeira não cobre, como erro de
schema/migração ou edição em massa por engano.

Recomendação pra um negócio real rodando nesse banco: considerar upgrade de plano se a
retenção do free tier for curta demais, e/ou rodar export manual antes de qualquer operação
arriscada (migração, edição em massa):

```bash
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d).sql
```

## Fotos (Cloudinary)

Fotos só saem do Cloudinary quando o carro é purgado em definitivo (lixeira expirada ou
"Apagar agora" em `/admin/lixeira`) — nunca antes disso. Enquanto o carro estiver só na
lixeira (dentro dos 30 dias), as fotos continuam intactas e são restauradas junto se o
carro for restaurado.
