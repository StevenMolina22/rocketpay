const { spawn } = require('child_process');

console.log('🔍 Obteniendo URL actual de localtunnel...');

// Intentar obtener la URL del API de localtunnel
const { exec } = require('child_process');

exec('curl -s http://localhost:4040/api/tunnels', (error, stdout, stderr) => {
  if (error || !stdout) {
    console.log('❌ No se pudo obtener la URL del API');
    console.log('💡 Iniciando localtunnel manualmente...');
    
    const lt = spawn('npx', ['localtunnel', '--port', '3000']);
    
    lt.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('your url is:')) {
        const url = output.split('your url is:')[1].trim();
        console.log('\n✅ URL OBTENIDA:');
        console.log('='.repeat(50));
        console.log('🌐 Webhook URL:');
        console.log(`${url}/webhook`);
        console.log('\n🔑 Verify Token:');
        console.log('RocketQR_2024');
        console.log('='.repeat(50));
        
        // Probar el webhook
        setTimeout(() => {
          exec(`curl -X GET "${url}/webhook?hub.mode=subscribe&hub.verify_token=RocketQR_2024&hub.challenge=test123"`, (error, stdout, stderr) => {
            if (error) {
              console.log('❌ Error probando webhook:', error.message);
            } else {
              console.log('✅ Webhook funcionando correctamente');
              console.log('📱 ¡Listo para configurar en Meta Developer Console!');
            }
          });
        }, 2000);
      }
    });
  } else {
    try {
      const tunnels = JSON.parse(stdout);
      if (tunnels.tunnels && tunnels.tunnels.length > 0) {
        const url = tunnels.tunnels[0].public_url;
        console.log('\n✅ URL OBTENIDA:');
        console.log('='.repeat(50));
        console.log('🌐 Webhook URL:');
        console.log(`${url}/webhook`);
        console.log('\n🔑 Verify Token:');
        console.log('RocketQR_2024');
        console.log('='.repeat(50));
        
        // Probar el webhook
        exec(`curl -X GET "${url}/webhook?hub.mode=subscribe&hub.verify_token=RocketQR_2024&hub.challenge=test123"`, (error, stdout, stderr) => {
          if (error) {
            console.log('❌ Error probando webhook:', error.message);
          } else {
            console.log('✅ Webhook funcionando correctamente');
            console.log('📱 ¡Listo para configurar en Meta Developer Console!');
          }
        });
      }
    } catch (e) {
      console.log('❌ Error parseando respuesta del API');
    }
  }
}); 