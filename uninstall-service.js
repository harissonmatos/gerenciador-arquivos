const InstallService = require('node-windows').Service;

// Cria um novo serviço
const svc = new InstallService({
  name: 'My Node.js Service',
  description: 'This is a Node.js service created with pkg.',
  script: require('path').join(__dirname, 'app.js')
});


svc.on('uninstall',function(){
  console.log("stop");
});

svc.uninstall();
