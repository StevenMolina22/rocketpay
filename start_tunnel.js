const { spawn } = require('child_process');

console.log('🚀 Iniciando RocketQR Bot...');
console.log('📡 Configurando túnel público...');

// Iniciar localtunnel
const lt = spawn('npx', ['localtunnel', '--port', '3000']);

let url = null;

lt.stdout.on('data', (data) => {
  const output = data.toString();
  
  if (output.includes('your url is:')) {
    url = output.split('your url is:')[1].trim();
    
    console.log('\n✅ TÚNEL CONFIGURADO EXITOSAMENTE');
    console.log('='.repeat(50));
    console.log('🌐 Webhook URL:');
    console.log(`${url}/webhook`);
    console.log('\n🔑 Verify Token:');
    console.log('RocketQR_2024');
    console.log('\n📋 Configuración para Meta Developer Console:');
    console.log('1. Ve a https://developers.facebook.com/');
    console.log('2. Tu app → WhatsApp → API Setup');
    console.log('3. Webhook URL: ' + url + '/webhook');
    console.log('4. Verify Token: RocketQR_2024');
    console.log('5. Selecciona: messages, message_deliveries');
    console.log('6. Haz clic en "Verify and Save"');
    console.log('='.repeat(50));
    
    // Probar el webhook
    setTimeout(() => {
      const { exec } = require('child_process');
      exec(`curl -X GET "${url}/webhook?hub.mode=subscribe&hub.verify_token=RocketQR_2024&hub.challenge=test123"`, (error, stdout, stderr) => {
        if (error) {
          console.log('❌ Error probando webhook:', error.message);
        } else {
          console.log('✅ Webhook funcionando correctamente');
          console.log('📱 ¡Listo para recibir mensajes de WhatsApp!');
        }
      });
    }, 2000);
  }
});

lt.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

lt.on('close', (code) => {
  console.log(`\n❌ Túnel cerrado con código ${code}`);
  console.log('Reinicia el script si necesitas continuar');
}); 