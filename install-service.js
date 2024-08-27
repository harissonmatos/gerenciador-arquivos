const InstallService = require('node-windows').Service;

// Cria um novo serviço
const svc = new InstallService({
  name: 'GERENCIADOR ARQUIVOS NEWTE',
  description: 'Aplicação para gerenciar arquivos via web api.',
  script: require('path').join(__dirname, 'app.js'),
});

// Escuta o evento de instalação do serviço
svc.on('install', () => {
  console.log('Service installed successfully!');
  svc.start();
});

// Instala o serviço
svc.install();
