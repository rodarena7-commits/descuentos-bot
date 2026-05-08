const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ============================================================
// CONFIGURACIÓN
// ============================================================
const NUMERO_BOT = process.env.NUMERO_BOT || '5491176634364@s.whatsapp.net';
const NUMERO_DUENO = process.env.NUMERO_DUENO || '541123484720@s.whatsapp.net';

// Asegurar que existe la carpeta de datos
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// ============================================================
// ALMACENAMIENTO DE DESCUENTOS
// ============================================================
let descuentosActivos = [];

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
            qrcode.generate(qr, { small: true });
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
🤖 Comandos disponibles:
- !help / !ayuda → Mostrar esta ayuda
- !estado → Estado del bot
- !descuentos → Ver descuentos activos
- !limpiar → Limpiar descuentos vencidos
- !scraping → Ejecutar scraping manual
        `;
        await sock.sendMessage(NUMERO_DUENO, { text: ayuda });
        return;
    }

    if (lowText === '!estado') {
        const estado = `
✅ Bot Descuentos Argentina
📊 Descuentos activos: ${descuentosActivos.length}
🔄 Última actualización: ${new Date().toLocaleString('es-AR')}
        `;
        await sock.sendMessage(NUMERO_DUENO, { text: estado });
        return;
    }

    if (lowText === '!descuentos') {
        if (descuentosActivos.length === 0) {
            await sock.sendMessage(NUMERO_DUENO, { text: 'No hay descuentos registrados aún' });
            return;
        }

        const resumen = descuentosActivos.slice(0, 10).map((d, i) =>
            `${i + 1}. [${d.banco}] ${d.descuento} en ${d.categoria}\n   Válido hasta: ${d.validoHasta}`
        ).join('\n\n');

        await sock.sendMessage(NUMERO_DUENO, { text: `📊 Descuentos activos:\n\n${resumen}` });
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
}

// ============================================================
// PROCESAR CONSULTA DE CLIENTE
// ============================================================
async function procesarConsultaCliente(sock, from, texto) {
    // Aquí implementaremos la lógica conversacional del bot
    // Por ahora, enviamos un mensaje de bienvenida

    const bienvenida = `
🎁 Bienvenido a Descuentos Bot Argentina

Te ayudaré a encontrar los mejores descuentos disponibles.

Para personalizarte mejor, cuéntame:
1️⃣ ¿Dónde estás ubicado?
2️⃣ ¿Qué medio de pago prefieres? (débito, crédito, billetera, etc.)
3️⃣ ¿En qué categoría buscas descuentos? (comida, compras, transporte, etc.)

Escribe tu respuesta o usa:
- !bancos → Ver descuentos por banco
- !lemon → Ver descuentos Lemon
- !mercadopago → Ver descuentos Mercado Pago
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
