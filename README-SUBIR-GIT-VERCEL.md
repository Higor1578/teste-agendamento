# Pasta para subir no GitHub e Vercel

Esta pasta contem o app sem `.env`, sem `node_modules` e sem `dist`.

Passos:

1. Abra esta pasta no terminal.
2. Rode:

```powershell
git init
git add .
git commit -m "Initial agendamento app"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
git push -u origin main
```

3. Na Vercel, importe esse repositorio.
4. Configure o build command:

```txt
npm run build
```

5. Configure as variaveis de ambiente na Vercel:

```txt
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Use os valores do seu `.env` local, mas nao envie o arquivo `.env` para o GitHub.
