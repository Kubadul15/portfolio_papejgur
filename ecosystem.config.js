module.exports = {
  apps: [
    {
      name: 'emergency-hamburg-rp-bot',
      script: 'src/index.js',
      cwd: __dirname,
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 20,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
