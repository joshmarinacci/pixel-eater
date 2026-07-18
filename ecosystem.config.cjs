module.exports = {
  apps : [{
    name: 'pixel-eater',
    script: 'src/index.ts',
    interpreter: 'node',
    watch: false,
    env_production: {
      NODE_ENV: 'production',
    }
  }],

  deploy : {
    production : {
      user: "deployman",
      key: '../deployman_private.key',
      host : 'josh.earth',
      ref  : 'origin/main',
      repo : 'https://github.com/joshmarinacci/pixel-eater.git',
      path : '/projects/pixel-eater/',
      'post-setup' : 'npm install',
      'post-deploy' : 'npm install && npm run build',
    }
  }
};
