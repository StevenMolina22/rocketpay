const { spawn } = require('child_process');

console.log('Iniciando localtunnel...');

const lt = spawn('npx', ['localtunnel', '--port', '3000']);

lt.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  if (output.includes('your url is:')) {
    const url = output.split('your url is:')[1].trim();
    console.log('\n🌐 URL del Webhook:');
    console.log(`${url}/webhook`);
    console.log('\n🔑 Verify Token:');
    console.log('RocketQR_2024');
    
    // Probar el webhook
    const { exec } = require('child_process');
    exec(`curl -X GET "${url}/webhook?hub.mode=subscribe&hub.verify_token=RocketQR_2024&hub.challenge=test123"`, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Error probando webhook:', error.message);
      } else {
        console.log('✅ Webhook funcionando correctamente');
      }
    });
  }
});

lt.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

lt.on('close', (code) => {
  console.log(`Localtunnel terminado con código ${code}`);
}); 