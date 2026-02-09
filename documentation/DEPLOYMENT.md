# 🚀 Deployment Guide - LucIA API

Instruções para colocar a aplicação em produção.

## 📋 Pré-requisitos

- Node.js 16+ (LTS recomendado)
- npm 8+
- Acesso ao servidor de produção
- Domínio/IP configurado

## 🏗️ Passos de Deployment

### 1. Preparar o Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 2. Clonar/Upload do Projeto

```bash
cd /var/www
sudo git clone <seu-repo> api-negocia
cd api-negocia

# Ou se usando upload manual:
scp -r /Users/kevinmedeiros/Enterprise/Cobrance/api-negocia user@server:/var/www/
```

### 3. Instalar Dependências

```bash
cd /var/www/api-negocia
npm ci  # Use 'ci' em produção em vez de 'install'
```

### 4. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
sudo nano .env
```

Adicione:

```
PORT=3000
API_KEY=sua_chave_api_aqui
NODE_ENV=production
SESSION_SECRET=gere_uma_string_aleatoria_longa_aqui
```

### 5. Build para Produção

```bash
npm run build
```

### 6. Configurar como Serviço Systemd

Crie `/etc/systemd/system/lucia-api.service`:

```ini
[Unit]
Description=LucIA Negotiation API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/api-negocia
Environment="NODE_ENV=production"
EnvironmentFile=/var/www/api-negocia/.env
ExecStart=/usr/bin/node /var/www/api-negocia/dist/index.js
Restart=always
RestartSec=10

# Limites de recursos
MemoryLimit=512M
CPUShares=1024

[Install]
WantedBy=multi-user.target
```

Ative o serviço:

```bash
sudo systemctl daemon-reload
sudo systemctl enable lucia-api
sudo systemctl start lucia-api
sudo systemctl status lucia-api
```

### 7. Configurar Nginx como Reverse Proxy

Crie `/etc/nginx/sites-available/lucia-api`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Redirecionar HTTP para HTTPS (opcional)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    # Certificados SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logs
    access_log /var/log/nginx/lucia-api-access.log;
    error_log /var/log/nginx/lucia-api-error.log;

    # Proxy para aplicação Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;
}
```

Ative o site:

```bash
sudo ln -s /etc/nginx/sites-available/lucia-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Configurar SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d seu-dominio.com
```

### 9. Monitoramento e Logs

```bash
# Ver logs da aplicação
sudo journalctl -u lucia-api -f

# Ver logs do Nginx
sudo tail -f /var/log/nginx/lucia-api-error.log
sudo tail -f /var/log/nginx/lucia-api-access.log

# Verificar saúde
curl https://seu-dominio.com/api/health
```

## 🔄 Atualizações

Para atualizar o código em produção:

```bash
cd /var/www/api-negocia
sudo git pull origin main
npm ci
npm run build
sudo systemctl restart lucia-api
```

## 📊 Performance e Escalabilidade

### PM2 (Alternativa ao Systemd)

Se preferir usar PM2:

```bash
sudo npm install -g pm2

# Criar ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'lucia-api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Iniciar
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### Load Balancing

Para múltiplas instâncias:

```nginx
upstream lucia_backend {
    least_conn;
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    # ... configuração anterior ...

    location / {
        proxy_pass http://lucia_backend;
        # ... resto do proxy ...
    }
}
```

## 🚨 Backup e Recuperação

```bash
# Backup diário
sudo crontab -e

# Adicione:
0 2 * * * cd /var/www/api-negocia && tar -czf backup-$(date +\%Y\%m\%d).tar.gz dist/ && mv backup-*.tar.gz /backups/
```

## 🔒 Segurança

### Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Headers de Segurança (Nginx)

Adicione ao bloco `server {}`:

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
    proxy_pass http://127.0.0.1:3000;
}
```

## 📈 Monitoramento

### Health Check Setup

```bash
# Adicione ao Nginx
location /healthcheck {
    access_log off;
    proxy_pass http://127.0.0.1:3000/api/health;
}
```

### Alertas (usando curl)

```bash
# Script de monitoramento
#!/bin/bash
while true; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://seu-dominio.com/api/health)
    if [ "$STATUS" != "200" ]; then
        echo "ALERTA: Serviço down! Status: $STATUS"
        # Enviar notificação (email, slack, etc)
    fi
    sleep 60
done
```

## 🆘 Troubleshooting

### Aplicação não inicia

```bash
sudo systemctl status lucia-api
sudo journalctl -u lucia-api -n 50
```

### Porta em uso

```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Problemas de sessão

- Verifique arquivo `.env` com SESSION_SECRET
- Limpe cache do navegador
- Reinicie a aplicação

### Erro de CORS

- Configure header no Express
- Adicione ao `src/index.ts`:

```typescript
app.use(
  cors({
    origin: ["https://seu-dominio.com"],
    credentials: true,
  }),
);
```

## 📞 Suporte

Para problemas, verifique:

1. Logs: `sudo journalctl -u lucia-api -f`
2. Arquivo `.env`: Variáveis de ambiente corretas
3. Permissões: `sudo chown -R www-data /var/www/api-negocia`
4. Versão Node: `node --version` (deve ser 16+)
