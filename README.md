# 🚀 RocketPay: Cobrar con Stellar en WhatsApp

**RocketPAY** es un sistema de cobro automatizado vía WhatsApp que permite a trabajadores informales y pequeños comerciantes recibir pagos en XLM (Lumens) de forma simple, sin fricción y con verificación automática en la blockchain de Stellar.

Millones de personas sin acceso a infraestructura bancaria necesitan una forma simple y directa de cobrar digitalmente.

**RocketPAY convierte WhatsApp en una herramienta de cobro.** Con un solo mensaje, el bot genera un link de pago, un código QR y verifica la transacción en Stellar.

## ✨ Características

- **Bot de WhatsApp** con API oficial (WABA)
- **URI de pago** `web+stellar:pay`
- **Código QR automático**
- **Verificación on-chain** vía Horizon
- **Notificación instantánea**
- **Generación automática de facturas**

## Ejecutar projecto
1. Tener una cuenta developer en meta para hostear el bot
2. Generar Access Token the Whatsapp
```sh
    # .env
    WHATSAPP_TOKEN=your_whatsapp_token
```
3. Iniciar el servidor
```sh
    npm run dev
```
4. Iniciar el servidor de túnel
```sh
    npm run tunnel
```
5. Agregar Webhook Callback URL en dashboard de Whatsapp

Agregar el link del webhook y el token de verificacion a la configuracion en el dashboard

## 🔄 Flujo del Usuario

1. El vendedor escribe a modo de mensaje el comando `/cobrar` y a continuación el monto, como por ejemplo `100` en WhatsApp
2. El bot responde con el URI de pago y una imagen JPG con un QR
3. El comprador paga
4. El bot verifica el pago, notifica al vendedor y le crea una factura para enviarle al comprador

## 💡 ¿Por qué XLM?

- **Rápido** (<5 seg)
- **Barato** (<0.00001 XLM)
- **Accesible y global**

## 📊 Estado actual

- ✅ **MVP funcional** con WhatsApp + Stellar
- 🔄 **En validación** con usuarios reales

## 🚀 Próximos pasos

- 📋 Historial de pagos
- 🏆 Reputación e identidad descentralizada
- 📦 Generación automática de etiqueta con información para envío de productos
- Conversión de monedas
- Implementar USDC
- Galeria de Productos y Comandos

**RocketPAY permite cobrar en cripto desde WhatsApp, sin apps ni bancos. Es simple, rápido y está pensado para quienes más lo necesitan.**

## 📱 Comandos Disponibles

- `/cobrar [monto]` - Genera un link de pago y QR para el monto especificado

## 🔗 Tecnologías

- **WhatsApp Business API** - Comunicación con usuarios
- **Stellar Blockchain** - Procesamiento de pagos
- **Node.js** - Backend del bot
- **Express.js** - Servidor web
- **QRCode** - Generación de códigos QR
