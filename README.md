# 🚀 RocketQR (WhatsApp Cloud API Version)

Este bot permite a vendedores enviar links de cobro en USDC a través de WhatsApp usando la API oficial de Meta (WhatsApp Cloud API).

## 🔧 Requisitos

- Cuenta en Meta for Developers
- Token de acceso (WhatsApp Token)
- ID del número de teléfono de prueba (Phone Number ID)
- Verificación del webhook con un Verify Token

## 🛠 Instalación

1. Instalar dependencias:

```
npm install
```

2. Crear un archivo `.env` con:

```
WHATSAPP_TOKEN=<TU TOKEN DE META>
VERIFY_TOKEN=rocketqrverify
PUBLIC_KEY=<TU CLAVE PÚBLICA DE STELLAR>
PHONE_NUMBER_ID=<ID DE TELÉFONO DE PRUEBA>
```

3. Ejecutar el bot:

```
node index.js
```

4. Publicar tu bot con `ngrok`:

```
npx ngrok http 3000
```

5. Configurar tu Webhook en Meta:

- URL: `https://TU_URL_DE_NGROK/webhook`
- Verify Token: `rocketqrverify`
- Eventos: `messages`, `message_status`

6. Probar enviando `/cobrar 10` desde tu número de prueba.

## ✨ Resultado

El bot te enviará un link de cobro con formato URI de Stellar compatible con billeteras.

