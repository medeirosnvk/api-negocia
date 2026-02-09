const path = require("path");

module.exports = {
  apps: [
    {
      name: "api-negocia-backend",
      script: "dist/index.js",
      cwd: __dirname,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: path.join(__dirname, "logs", "backend-error.log"),
      out_file: path.join(__dirname, "logs", "backend-out.log"),
      merge_logs: true,
      time: true,
    },
    {
      name: "api-negocia-frontend",
      script: "node_modules/.bin/vite",
      args: "preview --port 5176 --host",
      cwd: path.join(__dirname, "frontend"),
      exec_mode: "fork",
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
