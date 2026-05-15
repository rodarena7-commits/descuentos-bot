/**
 * chatService.js
 * Cerebro del bot de chat web.
 * Fetchea los descuentos de la API principal y usa Claude para responder
 * preguntas en lenguaje natural.
 */

const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');

const API_URL = process.env.DESCUENTOS_API_URL || 'https://ahorrointeligente-ancb.onrender.com';

// ── Cache de descuentos (evitar llamar la API en cada mensaje) ──────────────
let cacheDescuentos = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

async function fetchDescuentos() {
    const ahora = Date.now();
    if (cacheDescuentos && (ahora - cacheTimestamp) < CACHE_TTL_MS) {
        return cacheDescuentos;
    }
    try {
        const res = await axios.get(`${API_URL}/api/discounts/?limit=500`, { timeout: 15000 });
        cacheDescuentos = res.data;
        cacheTimestamp = ahora;
        return cacheDescuentos;
    } catch (err) {
        // Si falla, devolver cache vencido si existe
        if (cacheDescuentos) return cacheDescuentos;
        throw new Error('No se pudieron cargar los descuentos');
    }
}

// ── Formatea descuentos para el prompt (compacto para no exceder contexto) ──
function formatearDescuentosParaPrompt(descuentos) {
    return descuentos
        .filter(d => d.is_active)
        .map(d => {
            const partes = [`[${d.source}]`];
            if (d.percentage) partes.push(`${d.percentage}%`);
            partes.push(d.discount_type === 'reintegro' ? 'reintegro' : d.discount_type === 'promocion' ? 'promo' : 'desc.');
            partes.push(`en ${d.category}`);
            if (d.days_of_week && d.days_of_week !== 'todos') partes.push(`(${d.days_of_week})`);
            else partes.push('(todos los días)');
            if (d.max_amount) partes.push(`tope $${d.max_amount.toLocaleString('es-AR')}`);
            partes.push(`— ${d.title}`);
            return partes.join(' ');
        })
        .join('\n');
}

// ── Prompt del sistema ────────────────────────────────────────────────────────
function buildSystemPrompt(descuentos, userName = '', canal = 'whatsapp') {
    const lista = formatearDescuentosParaPrompt(descuentos);
    const nombreLinea = userName ? `El nombre del usuario es *${userName}*.` : 'No conocés el nombre del usuario.';
    const formatoLinea = canal === 'whatsapp'
        ? '- Usá formato WhatsApp: *negrita*, _cursiva_, saltos de línea. Sin markdown de código ni tablas.'
        : '- Usá formato limpio con emojis y saltos de línea.';

    return `Sos el asistente de "Ahorro Inteligente (AI)", el bot de descuentos más completo de Argentina.
Tu misión: ayudar a los usuarios a encontrar descuentos, promos y reintegros de bancos, fintechs y exchanges.

${nombreLinea}

REGLAS DE CONVERSACIÓN:
- Respondé SIEMPRE en español argentino, amigable y natural
- Si el usuario dice "hola", "buenas", "hey" u otro saludo → saludalo por su nombre si lo tenés, y preguntale qué descuentos está buscando
- Si pregunta algo concreto → respondé directamente con los descuentos más relevantes
- Mostrá máximo 6 descuentos por respuesta, los más útiles primero
- Si menciona banco, día, categoría o porcentaje → filtrá exactamente por eso
- Si la consulta es vaga → mostrá los mejores descuentos variados
- Si no hay descuentos para lo pedido → decilo honestamente y sugerí alternativas
- No inventes descuentos que no estén en la lista de abajo
- Podés hacer preguntas de seguimiento para afinar la búsqueda
${formatoLinea}

DESCUENTOS ACTIVOS (${descuentos.length} total):
${lista}`;
}

// ── Historial de conversaciones por sesión ────────────────────────────────────
const historialSesiones = new Map();
const MAX_HISTORIAL = 10; // mensajes por sesión

function obtenerHistorial(sessionId) {
    return historialSesiones.get(sessionId) || [];
}

function actualizarHistorial(sessionId, role, content) {
    const hist = obtenerHistorial(sessionId);
    hist.push({ role, content });
    // Mantener solo los últimos N mensajes
    if (hist.length > MAX_HISTORIAL) hist.splice(0, hist.length - MAX_HISTORIAL);
    historialSesiones.set(sessionId, hist);
    // Limpiar sesiones antiguas (> 30 min sin actividad) — simple GC
    if (historialSesiones.size > 1000) {
        const oldest = [...historialSesiones.keys()][0];
        historialSesiones.delete(oldest);
    }
}

// ── Función principal ─────────────────────────────────────────────────────────
async function responderChat(mensaje, sessionId = 'default', userName = '', canal = 'whatsapp') {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return { respuesta: '❌ El bot no tiene la API key de IA configurada. Contactá al administrador.', ok: false };
    }

    let descuentos;
    try {
        descuentos = await fetchDescuentos();
    } catch (err) {
        return { respuesta: '⚠️ No pude cargar los descuentos en este momento. Intentá de nuevo en unos segundos.', ok: false };
    }

    const client = new Anthropic({ apiKey });

    // Agregar mensaje del usuario al historial
    actualizarHistorial(sessionId, 'user', mensaje);

    try {
        const response = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: buildSystemPrompt(descuentos, userName, canal),
            messages: obtenerHistorial(sessionId),
        });

        const respuesta = response.content[0].text;

        // Guardar respuesta en el historial
        actualizarHistorial(sessionId, 'assistant', respuesta);

        return { respuesta, ok: true };
    } catch (err) {
        console.error('Error Claude API:', err.message);
        return { respuesta: '⚠️ Hubo un error al procesar tu consulta. Intentá de nuevo.', ok: false };
    }
}

module.exports = { responderChat };
