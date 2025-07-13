const { spawn } = require('child_process');

console.log('🚀 Configurando RocketQR Bot...');

// Intentar con diferentes subdominios
const subdomains = ['rocketqr-bot', 'rocketqr', 'stellar-bot', 'whatsapp-bot'];

function trySubdomain(index) {
  if (index >= subdomains.length) {
    console.log('❌ No se pudo establecer conexión con localtunnel');
    console.log('💡 Intenta usar ngrok o un servicio similar');
    return;
  }

  const subdomain = subdomains[index];
  console.log(`📡 Intentando con subdominio: ${subdomain}`);
  
  const lt = spawn('npx', ['localtunnel', '--port', '3000', '--subdomain', subdomain]);
  
  let url = null;
  
  lt.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    
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
    }
  });
  
  lt.stderr.on('data', (data) => {
    const error = data.toString();
    if (error.includes('subdomain')) {
      console.log(`❌ Subdominio ${subdomain} no disponible, probando siguiente...`);
      lt.kill();
      setTimeout(() => trySubdomain(index + 1), 1000);
    }
  });
  
  lt.on('close', (code) => {
    if (code !== 0 && !url) {
      setTimeout(() => trySubdomain(index + 1), 1000);
    }
  });
}

trySubdomain(0); 