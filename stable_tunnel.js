const { spawn } = require('child_process');

console.log('🚀 Iniciando túnel estable para RocketQR...');

let url = null;
let retries = 0;
const maxRetries = 5;

function startTunnel() {
  if (retries >= maxRetries) {
    console.log('❌ Máximo de intentos alcanzado');
    return;
  }

  console.log(`📡 Intento ${retries + 1}/${maxRetries}...`);
  
  const lt = spawn('npx', ['localtunnel', '--port', '3000']);
  
  lt.stdout.on('data', (data) => {
    const output = data.toString();
    
    if (output.includes('your url is:')) {
      url = output.split('your url is:')[1].trim();
      console.log('\n✅ TÚNEL ESTABLE CONFIGURADO');
      console.log('='.repeat(60));
      console.log('🌐 Webhook URL:');
      console.log(`${url}/webhook`);
      console.log('\n🔑 Verify Token:');
      console.log('rocketqrverify');
      console.log('\n📋 Configuración para Meta Developer Console:');
      console.log('1. Ve a https://developers.facebook.com/');
      console.log('2. Tu app → WhatsApp → API Setup');
      console.log('3. Webhook URL: ' + url + '/webhook');
      console.log('4. Verify Token: rocketqrverify');
      console.log('5. Selecciona: messages, message_deliveries');
      console.log('6. Haz clic en "Verify and Save"');
      console.log('='.repeat(60));
      
      // Probar el webhook
      setTimeout(() => {
        const { exec } = require('child_process');
        exec(`curl -X GET "${url}/webhook?hub.mode=subscribe&hub.verify_token=rocketqrverify&hub.challenge=test123"`, (error, stdout, stderr) => {
          if (error) {
            console.log('❌ Error probando webhook:', error.message);
          } else {
            console.log('✅ Webhook funcionando correctamente');
            console.log('📱 ¡Listo para configurar en Meta Developer Console!');
          }
        });
      }, 3000);
    }
  });
  
  lt.stderr.on('data', (data) => {
    const error = data.toString();
    if (error.includes('connection refused') || error.includes('tunnel unavailable')) {
      console.log('❌ Error de conexión, reintentando...');
      lt.kill();
      retries++;
      setTimeout(startTunnel, 2000);
    }
  });
  
  lt.on('close', (code) => {
    if (code !== 0 && !url) {
      console.log('❌ Túnel cerrado inesperadamente, reintentando...');
      retries++;
      setTimeout(startTunnel, 2000);
    }
  });
}

startTunnel(); 