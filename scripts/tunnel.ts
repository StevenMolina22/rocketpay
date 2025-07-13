

import { spawn, exec } from 'child_process';
import "dotenv/config";

const PORT = process.env.PORT || '3000';
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'rocketqrverify';

let url: string | null = null;
let retries = 0;
const maxRetries = 5;

function startTunnel() {
  if (retries >= maxRetries) {
    console.log('❌ Maximum retries reached. Could not establish a tunnel.');
    return;
  }

  console.log(`📡 Attempting to start localtunnel (Attempt ${retries + 1}/${maxRetries})...`);

  const lt = spawn('npx', ['localtunnel', '--port', PORT]);

  lt.stdout.on('data', (data: Buffer) => {
    const output = data.toString();

    if (output.includes('your url is:')) {
      url = output.split('your url is:')[1].trim();
      console.log('\n✅ TUNNEL ESTABLISHED SUCCESSFULLY');
      console.log('='.repeat(60));
      console.log('🌐 Webhook URL:');
      console.log(`   ${url}/webhook`);
      console.log('\n🔑 Verify Token:');
      console.log(`   ${VERIFY_TOKEN}`);
      console.log('\n📋 Configuration for Meta Developer Console:');
      console.log('1. Go to https://developers.facebook.com/');
      console.log('2. Your App → WhatsApp → API Setup');
      console.log(`3. Webhook URL: ${url}/webhook`);
      console.log(`4. Verify Token: ${VERIFY_TOKEN}`);
      console.log('5. Select: messages');
      console.log('6. Click "Verify and Save"');
      console.log('='.repeat(60));

      // Test the webhook
      setTimeout(() => {
        exec(`curl -X GET "${url}/webhook?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=test123"`, (error: any, stdout: string, stderr: string) => {
          if (error) {
            console.log('❌ Error testing webhook:', error.message);
          } else {
            console.log('✅ Webhook is responding correctly.');
            console.log('📱 Ready to configure in the Meta Developer Console!');
          }
        });
      }, 3000);
    }
  });

  lt.stderr.on('data', (data: Buffer) => {
    const error = data.toString();
    if (error.includes('connection refused') || error.includes('tunnel unavailable')) {
      console.log('❌ Connection error, retrying...');
      lt.kill();
    }
  });

  lt.on('close', (code: number) => {
    if (code !== 0 && !url) {
      console.log(' Tunnel closed unexpectedly, retrying...');
      retries++;
      setTimeout(startTunnel, 2000);
    }
  });
}

startTunnel();

