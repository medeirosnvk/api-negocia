# Deployment Guide - LucIA API

Instrucoes para colocar a aplicacao em producao.

## Pre-requisitos

- Node.js 18+ (LTS recomendado)
- npm 8+
- Acesso ao servidor de producao
- Dominio/IP configurado

## Passos de Deployment

### 1. Preparar o Servidor

```bash
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

node --version
npm --version
```

### 2. Clonar/Upload do Projeto

```bash
cd /var/www
sudo git clone <seu-repo> api-negocia
cd api-negocia
```

### 3. Instalar Dependencias

```bash
cd /var/www/api-negocia

# Backend
cd backend && npm ci && cd ..

# Frontend
cd frontend && npm ci && cd ..
```

### 4. Configurar Variaveis de Ambiente

```bash
sudo nano backend/.env
```

Adicione:

```env
PORT=3001
API_KEY=sua_chave_api_aqui
NODE_ENV=production
SESSION_SECRET=gere_uma_string_aleatoria_longa_aqui
```

### 5. Build para Producao

```bash
# Da raiz do projeto
npm run build
```

Isso compila:
- Backend: `backend/dist/`
- Frontend: `frontend/dist/`

### 6. PM2 (Recomendado)

```bash
sudo npm install -g pm2

# Iniciar com ecosystem
pm2 start ecosystem.config.cjs
pm2 startup
pm2 save
```

O `ecosystem.config.cjs` ja esta configurado para rodar:
- Backend a partir de `backend/dist/index.js`
- Frontend preview a partir de `frontend/`

### 7. Alternativa: Systemd

Crie `/etc/systemd/system/lucia-api.service`:

```ini
[Unit]
Description=LucIA Negotiation API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/api-negocia/backend
Environment="NODE_ENV=production"
EnvironmentFile=/var/www/api-negocia/backend/.env
ExecStart=/usr/bin/node /var/www/api-negocia/backend/dist/index.js
Restart=always
RestartSec=10
MemoryLimit=512M

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable lucia-api
sudo systemctl start lucia-api
sudo systemctl status lucia-api
```

### 8. Configurar Nginx como Reverse Proxy

Crie `/etc/nginx/sites-available/lucia-api`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    access_log /var/log/nginx/lucia-api-access.log;
    error_log /var/log/nginx/lucia-api-error.log;

    # API backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend static files
    location / {
        root /var/www/api-negocia/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/api-negocia/frontend/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/lucia-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9. Configurar SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d seu-dominio.com
```

### 10. Monitoramento e Logs

```bash
# PM2
pm2 logs
pm2 monit

# Systemd
sudo journalctl -u lucia-api -f

# Nginx
sudo tail -f /var/log/nginx/lucia-api-error.log

# Health check
curl https://seu-dominio.com/api/health
```

## Atualizacoes

```bash
cd /var/www/api-negocia
sudo git pull origin main
cd backend && npm ci && cd ..
cd frontend && npm ci && cd ..
npm run build
pm2 restart ecosystem.config.cjs
```

## Seguranca

### Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Headers de Seguranca (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://127.0.0.1:3001;
}
```

## Troubleshooting

### Aplicacao nao inicia

```bash
# PM2
pm2 logs api-negocia-backend --lines 50

# Systemd
sudo systemctl status lucia-api
sudo journalctl -u lucia-api -n 50
```

### Porta em uso

```bash
sudo lsof -i :3001
sudo kill -9 <PID>
```

### Problemas de sessao

- Verifique `backend/.env` com SESSION_SECRET
- Limpe cache do navegador
- Reinicie a aplicacao
