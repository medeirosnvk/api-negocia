const path = require("path");

module.exports = {
  apps: [
    {
      name: "api-negocia",
      script: "dist/index.js",
      cwd: __dirname,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        PORT: 3001,
        NODE_ENV: "production",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: path.join(__dirname, "logs", "error.log"),
      out_file: path.join(__dirname, "logs", "out.log"),
      merge_logs: true,
      time: true,
    },
  ],
};
