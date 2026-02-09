const path = require("path");

module.exports = {
  apps: [
    {
      name: "negocia-backend",
      script: "dist/index.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        PORT: 3001,
        NODE_ENV: "production",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: path.join(__dirname, "logs", "backend-error.log"),
      out_file: path.join(__dirname, "logs", "backend-out.log"),
      merge_logs: true,
      time: true,
    },
    {
      name: "negocia-frontend",
      script: "node_modules/.bin/serve",
      args: "-s frontend/dist -l 5176 --no-clipboard",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: path.join(__dirname, "logs", "frontend-error.log"),
      out_file: path.join(__dirname, "logs", "frontend-out.log"),
      merge_logs: true,
      time: true,
    },
  ],
};
