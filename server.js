const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

const logger = require('./utils/logger');
const scrapersIndex = require('./scrapers/index');
const scheduler = require('./services/scheduler');
const notificador = require('./services/notificador');

// ============================================================
// SERVIDOR HTTP (PARA MANTENER EL SERVICIO ACTIVO EN RENDER)
// ============================================================
const app = express();
const PORT = process.env.PORT || 3000;
let qrString = null; // Guardar QR actual para servir en /qr

app.get('/health', (req, res) => {
  res.status(200).json({ status: '✅ Bot activo', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: '🤖 Descuentos Bot - Running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/qr', async (req, res) => {
  if (!qrString) {
    return res.status(400).json({
      error: '❌ QR no disponible',
      message: 'El bot aún no ha generado un código QR. Intenta de nuevo en unos momentos.',
      help: 'Escanea este QR con WhatsApp personal para autenticar el bot'
    });
  }

  try {
    const qrImage = await QRCode.toDataURL(qrString);
    res.type('text/html').send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🤖 Descuentos Bot - Autenticación</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
          }
          h1 { color: #333; margin-bottom: 10px; font-size: 28px; }
          p { color: #666; margin-bottom: 30px; line-height: 1.6; }
          .qr-box {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 15px;
            display: inline-block;
            margin: 20px 0;
          }
          img {
            width: 300px;
            height: 300px;
            border-radius: 10px;
          }
          .instructions {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin-top: 20px;
            text-align: left;
            border-radius: 5px;
          }
          .instructions h3 {
            color: #1976d2;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .instructions ol {
            margin-left: 20px;
            color: #555;
          }
          .instructions li {
            margin: 8px 0;
          }
          .status {
            background: #c8e6c9;
            color: #2e7d32;
            padding: 10px;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🤖 Descuentos Bot</h1>
          <p>Escanea este código QR con <strong>WhatsApp personal</strong> para autenticar el bot</p>

          <div class="qr-box">
            <img src="${qrImage}" alt="QR Code">
          </div>

          <div class="instructions">
            <h3>📱 Cómo autenticar:</h3>
            <ol>
              <li>Abre <strong>WhatsApp personal</strong> en tu teléfono</li>
              <li>Ve a <strong>Configuración</strong> → <strong>Vinculado con cuenta</strong></li>
              <li>Toca <strong>Vincular un dispositivo</strong></li>
              <li>Apunta tu cámara al código QR de arriba</li>
              <li>¡Listo! El bot se autenticará automáticamente</li>
            </ol>
          </div>

          <div class="status">✅ El bot está escuchando...</div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).json({ error: 'Error generando QR', details: error.message });
  }
});

app.listen(PORT, () => {
  logger.info(`🌐 Servidor HTTP escuchando en puerto ${PORT}`);
  logger.info(`📱 Escanea el QR en: https://descuentostuyos.onrender.com/qr`);
});

// ============================================================
// CONFIGURACIÓN
// ============================================================
const NUMERO_BOT = process.env.NUMERO_BOT || '5491158660344@s.whatsapp.net';
const NUMERO_DUENO = process.env.NUMERO_DUENO || '5491158660344@s.whatsapp.net';
const NOMBRE_CANAL = process.env.NOMBRE_CANAL || 'descuentostuyos';

// Asegurar que existe la carpeta de datos
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// ============================================================
// ALMACENAMIENTO DE DESCUENTOS Y CANAL
// ============================================================
let descuentosActivos = [];
let canalId = null;

function cargarDescuentos() {
    const archivoDescuentos = path.join(dataDir, 'descuentos.json');
    if (fs.existsSync(archivoDescuentos)) {
        const contenido = fs.readFileSync(archivoDescuentos, 'utf8');
        descuentosActivos = JSON.parse(contenido);
        logger.info(`📦 ${descuentosActivos.length} descuentos cargados`);
    } else {
        descuentosActivos = [];
        logger.info('📦 Iniciando con base de datos vacía');
    }
}

function guardarDescuentos() {
    const archivoDescuentos = path.join(dataDir, 'descuentos.json');
    fs.writeFileSync(archivoDescuentos, JSON.stringify(descuentosActivos, null, 2));
}

// ============================================================
// CONEXIÓN A WHATSAPP
// ============================================================
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrString = qr; // Guardar QR para servir en /qr endpoint
            qrcode.generate(qr, { small: true });
            logger.info(`📱 QR generado - Escanea en: https://descuentostuyos.onrender.com/qr`);
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            logger.error(`❌ Conexión cerrada. Reconectando: ${shouldReconnect}`);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            logger.info('✅ Bot conectado a WhatsApp');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Buscar o crear el canal de notificaciones
    sock.ev.on('contacts.update', async (contacts) => {
        if (!canalId) {
            const canales = await sock.groupFetchAllParticipating();
            for (const [id, grupo] of Object.entries(canales)) {
                if (grupo.subject && grupo.subject.toLowerCase() === NOMBRE_CANAL.toLowerCase()) {
                    canalId = id;
                    logger.info(`✅ Canal "${NOMBRE_CANAL}" encontrado: ${id}`);

                    // Activar schedule de notificaciones cada 6 horas
                    scheduler.crearSchedule(sock, canalId, 6, (nuevosDescuentos) => {
                        descuentosActivos = nuevosDescuentos;
                        logger.info(`♻️ Descuentos recargados en memoria: ${descuentosActivos.length}`);
                    });
                    break;
                }
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];

        if (msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message?.conversation ||
                     msg.message?.extendedTextMessage?.text ||
                     msg.message?.imageMessage?.caption || "";

        if (!text) return;

        logger.info(`📨 Mensaje de ${from}: ${text}`);

        // Procesar comandos del dueño
        if (from === NUMERO_DUENO) {
            await procesarComandoDueno(sock, text);
            return;
        }

        // Procesar consultas de clientes
        await procesarConsultaCliente(sock, from, text);
    });

    return sock;
}

// ============================================================
// PROCESAR COMANDOS DEL DUEÑO
// ============================================================
async function procesarComandoDueno(sock, texto) {
    const lowText = texto.toLowerCase().trim();

    if (lowText === '!help' || lowText === '!ayuda') {
        const ayuda = `
🤖 *Comandos disponibles:*
- !help / !ayuda → Mostrar esta ayuda
- !estado → Estado del bot
- !descuentos → Ver descuentos activos
- !limpiar → Limpiar descuentos vencidos
- !scraping → Ejecutar scraping manual ahora
- !canal → Buscar canal de notificaciones
        `;
        await sock.sendMessage(NUMERO_DUENO, { text: ayuda });
        return;
    }

    if (lowText === '!estado') {
        const estado = `
✅ *Bot Descuentos Argentina*
📊 Descuentos activos: ${descuentosActivos.length}
🔄 Última actualización: ${new Date().toLocaleString('es-AR')}
📢 Canal: ${canalId ? '✅ Conectado' : '❌ No encontrado'}
        `;
        await sock.sendMessage(NUMERO_DUENO, { text: estado });
        return;
    }

    if (lowText === '!descuentos') {
        if (descuentosActivos.length === 0) {
            await sock.sendMessage(NUMERO_DUENO, { text: 'No hay descuentos registrados aún' });
            return;
        }

        const resumen = descuentosActivos.slice(0, 15).map((d, i) =>
            `${i + 1}. *[${d.banco}]* ${d.descuento} en ${d.categoria}\n   Válido: ${d.validoHasta}`
        ).join('\n\n');

        await sock.sendMessage(NUMERO_DUENO, { text: `📊 *Descuentos activos:*\n\n${resumen}` });
        return;
    }

    if (lowText === '!limpiar') {
        const antes = descuentosActivos.length;
        const hoy = new Date().toISOString().split('T')[0];
        descuentosActivos = descuentosActivos.filter(d => d.validoHasta >= hoy);
        guardarDescuentos();

        await sock.sendMessage(NUMERO_DUENO, {
            text: `🧹 Descuentos vencidos eliminados: ${antes - descuentosActivos.length}\nDescuentos activos: ${descuentosActivos.length}`
        });
        return;
    }

    if (lowText === '!scraping') {
        await sock.sendMessage(NUMERO_DUENO, { text: '⏳ Ejecutando scraping...' });
        const resultado = await scheduler.ejecutarScrapingAutomatico(sock, canalId, (nuevosDescuentos) => {
            descuentosActivos = nuevosDescuentos;
            logger.info(`♻️ Descuentos recargados en memoria: ${descuentosActivos.length}`);
        });

        if (resultado.exito) {
            const msg = `
✅ *Scraping completado*
📦 Total descuentos: ${resultado.totalDescuentos}
🎁 Nuevos: ${resultado.nuevos}
⚠️ Errores: ${resultado.errores.length}
            `;
            await sock.sendMessage(NUMERO_DUENO, { text: msg });
        } else {
            await sock.sendMessage(NUMERO_DUENO, { text: `❌ Error: ${resultado.error}` });
        }
        return;
    }

    if (lowText === '!canal') {
        if (canalId) {
            await sock.sendMessage(NUMERO_DUENO, { text: `✅ Canal "${NOMBRE_CANAL}" encontrado y conectado` });
        } else {
            await sock.sendMessage(NUMERO_DUENO, { text: `❌ Canal "${NOMBRE_CANAL}" no encontrado. Asegúrate de crear el canal primero.` });
        }
        return;
    }
}

// ============================================================
// PROCESAR CONSULTA DE CLIENTE
// ============================================================
const conversacionesClientes = new Map(); // Rastrear estado de conversación

async function procesarConsultaCliente(sock, from, texto) {
    const lowText = texto.toLowerCase().trim();

    // Comando: Ver TODOS los descuentos
    if (lowText === '!todos') {
        if (descuentosActivos.length === 0) {
            await sock.sendMessage(from, { text: 'No hay descuentos disponibles aún.' });
            return;
        }
        const { formatearListaDescuentos } = require('./utils/formatters');
        const texto = formatearListaDescuentos(descuentosActivos);
        await sock.sendMessage(from, { text: texto });
        return;
    }

    // Comando: BANCOS (todos incluidos nuevos)
    if (lowText === '!bancos') {
        const descuentosBancos = descuentosActivos.filter(d =>
            ['BBVA', 'Santander', 'Galicia', 'Macro', 'Itaú', 'Credicoop', 'Hipotecario', 'Banco Nación', 'HSBC', 'ICBC', 'Banco Ciudad'].includes(d.banco)
        );
        if (descuentosBancos.length > 0) {
            const resumen = descuentosBancos.map(d =>
                `*${d.banco}*: ${d.descuento} en ${d.categoria} (${d.medioPago})`
            ).join('\n');
            await sock.sendMessage(from, { text: `🏦 *Descuentos Bancos*\n\n${resumen}` });
        }
        return;
    }

    if (lowText === '!lemon') {
        const lemon = descuentosActivos.filter(d => d.banco === 'Lemon');
        if (lemon.length > 0) {
            const resumen = lemon.map(d =>
                `*${d.descuento}* en ${d.categoria}\n${d.requisitos}`
            ).join('\n\n');
            await sock.sendMessage(from, { text: `🍋 *Descuentos Lemon*\n\n${resumen}` });
        }
        return;
    }

    if (lowText === '!mercadopago') {
        const mp = descuentosActivos.filter(d => d.banco === 'Mercado Pago');
        if (mp.length > 0) {
            const resumen = mp.map(d =>
                `*${d.descuento}* en ${d.categoria}\n${d.requisitos}`
            ).join('\n\n');
            await sock.sendMessage(from, { text: `📱 *Descuentos Mercado Pago*\n\n${resumen}` });
        }
        return;
    }

    // Nuevos comandos rápidos
    if (lowText === '!naranjax') {
        const naranja = descuentosActivos.filter(d => d.banco === 'NaranjaX');
        if (naranja.length > 0) {
            const resumen = naranja.map(d => `*${d.descuento}* en ${d.categoria}\n${d.requisitos}`).join('\n\n');
            await sock.sendMessage(from, { text: `🟠 *Descuentos NaranjaX*\n\n${resumen}` });
        }
        return;
    }

    if (lowText === '!uala') {
        const uala = descuentosActivos.filter(d => d.banco === 'Ualá');
        if (uala.length > 0) {
            const resumen = uala.map(d => `*${d.descuento}* en ${d.categoria}\n${d.requisitos}`).join('\n\n');
            await sock.sendMessage(from, { text: `💜 *Descuentos Ualá*\n\n${resumen}` });
        }
        return;
    }

    if (lowText === '!bna' || lowText === '!nacion') {
        const bna = descuentosActivos.filter(d => d.banco === 'Banco Nación');
        if (bna.length > 0) {
            const resumen = bna.map(d => `*${d.descuento}* en ${d.categoria}\n${d.requisitos}`).join('\n\n');
            await sock.sendMessage(from, { text: `🏛️ *Descuentos Banco Nación*\n\n${resumen}` });
        }
        return;
    }

    if (lowText === '!dia') {
        const dia = descuentosActivos.filter(d => d.banco === 'Día%');
        if (dia.length > 0) {
            const resumen = dia.map(d => `*${d.descuento}* en ${d.categoria}\n${d.requisitos}`).join('\n\n');
            await sock.sendMessage(from, { text: `🛍️ *Descuentos Día%*\n\n${resumen}` });
        }
        return;
    }

    if (lowText === '!rappi') {
        const rappi = descuentosActivos.filter(d => d.banco === 'Rappi');
        if (rappi.length > 0) {
            const resumen = rappi.map(d => `*${d.descuento}* en ${d.categoria}\n${d.requisitos}`).join('\n\n');
            await sock.sendMessage(from, { text: `🚗 *Descuentos Rappi*\n\n${resumen}` });
        }
        return;
    }

    if (lowText === '!pedidosya') {
        const py = descuentosActivos.filter(d => d.banco === 'PedidosYa');
        if (py.length > 0) {
            const resumen = py.map(d => `*${d.descuento}* en ${d.categoria}\n${d.requisitos}`).join('\n\n');
            await sock.sendMessage(from, { text: `📱 *Descuentos PedidosYa*\n\n${resumen}` });
        }
        return;
    }

    // Búsqueda por palabras clave
    if (lowText.includes('supermercado') || lowText.includes('compra')) {
        const descuentos = descuentosActivos.filter(d =>
            d.categoria.toLowerCase().includes('supermercado') ||
            d.categoria.toLowerCase().includes('compra')
        );
        if (descuentos.length > 0) {
            const resumen = descuentos.slice(0, 5).map(d =>
                `*${d.banco}*: ${d.descuento} en ${d.categoria}\n💵 Monto: $${d.monto}\n⏰ Válido: ${d.validoHasta}`
            ).join('\n\n');
            await sock.sendMessage(from, { text: `🛒 *Descuentos en Supermercados*\n\n${resumen}` });
        }
        return;
    }

    if (lowText.includes('restaurante') || lowText.includes('comida')) {
        const descuentos = descuentosActivos.filter(d =>
            d.categoria.toLowerCase().includes('gastro') ||
            d.categoria.toLowerCase().includes('comida')
        );
        if (descuentos.length > 0) {
            const resumen = descuentos.map(d =>
                `*${d.banco}*: ${d.descuento}\n${d.requisitos}`
            ).join('\n\n');
            await sock.sendMessage(from, { text: `🍽️ *Descuentos en Gastronomía*\n\n${resumen}` });
        }
        return;
    }

    // Mensaje de bienvenida/ayuda
    const bienvenida = `
🎁 *Descuentos Argentina - Bot*

Encontrá los mejores descuentos disponibles en Argentina.

*📋 Comandos de Bancos:*
- !bancos → Todos los bancos
- !bna → Banco Nación
- Otros: !naranjax, !uala

*💳 Comandos de Billeteras/Plataformas:*
- !lemon → Descuentos Lemon
- !mercadopago → Mercado Pago
- !rappi → Rappi
- !pedidosya → PedidosYa
- !dia → Día%

*🎯 Otros:*
- !todos → Ver TODOS los descuentos
- Pregunta por: supermercado, restaurante, viajes, transporte, farmacia, etc.

Total disponible: *${descuentosActivos.length} descuentos* 🎉
    `;

    await sock.sendMessage(from, { text: bienvenida });
}

// ============================================================
// MAIN
// ============================================================
async function main() {
    logger.info('🚀 Iniciando Bot Descuentos Argentina...');

    cargarDescuentos();

    const sock = await connectToWhatsApp();

    // Aquí se agregarán los scrapers y la lógica de actualización automática
    logger.info('✅ Bot listo');
}

main().catch(err => {
    logger.error('❌ Error en main:', err);
    process.exit(1);
});

// Manejar señales de cierre
process.on('SIGINT', () => {
    logger.info('👋 Cerrando bot...');
    process.exit(0);
});
