/**
 * chatService.js
 * Cerebro del bot de chat — responde con IA en lenguaje natural.
 *
 * Prioridad de IA:
 *   1. Groq  (gratis, muy rápido — llama-3.3-70b)
 *   2. Claude (backup si Groq falla o no tiene créditos)
 *   3. Fallback básico (keywords, sin IA)
 */

const Groq = require('groq-sdk');
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');

const API_URL = process.env.DESCUENTOS_API_URL || 'https://ahorrointeligente-ancb.onrender.com';
const GROQ_MODEL = 'llama-3.3-70b-versatile';   // gratis en Groq, muy capaz
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'; // backup

// ── Cache de descuentos ───────────────────────────────────────────────────────
let cacheDescuentos = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 10 * 60 * 1000;

async function fetchDescuentos() {
    const ahora = Date.now();
    if (cacheDescuentos && (ahora - cacheTimestamp) < CACHE_TTL_MS) return cacheDescuentos;
    try {
        const res = await axios.get(`${API_URL}/api/discounts/?limit=500`, { timeout: 15000 });
        cacheDescuentos = res.data;
        cacheTimestamp = ahora;
        return cacheDescuentos;
    } catch {
        if (cacheDescuentos) return cacheDescuentos;
        throw new Error('No se pudieron cargar los descuentos');
    }
}

// ── Formatea descuentos para el prompt ────────────────────────────────────────
function formatearDescuentosParaPrompt(descuentos) {
    return descuentos
        .filter(d => d.is_active)
        .map(d => {
            const partes = [`[${d.source}]`];
            if (d.percentage) partes.push(`${d.percentage}%`);
            partes.push(d.discount_type === 'reintegro' ? 'reintegro'
                : d.discount_type === 'promocion' ? 'promo' : 'desc.');
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
    const nombreLinea = userName
        ? `El nombre del usuario es "${userName}".`
        : 'No conocés el nombre del usuario.';
    const formatoLinea = canal === 'whatsapp'
        ? 'Usá formato WhatsApp: *negrita*, saltos de línea. Sin markdown de código ni tablas.'
        : 'Usá emojis y saltos de línea. Sin markdown técnico.';

    return `Sos el asistente de "Ahorro Inteligente (AI)", el bot de descuentos más completo de Argentina.
Tu misión: ayudar a los usuarios a encontrar descuentos, promos y reintegros de bancos, fintechs y exchanges crypto.

${nombreLinea}

REGLAS:
- Respondé SIEMPRE en español argentino, amigable y natural
- Si el usuario saluda ("hola", "buenas", "hey", etc.) → saludalo por nombre si lo tenés, preguntale qué descuentos busca
- Si pregunta algo concreto → respondé con los descuentos más relevantes directamente
- Mostrá máximo 6 descuentos por respuesta
- Filtrá por banco, día, categoría o porcentaje si el usuario lo menciona
- Si la consulta es vaga → mostrá variedad de los mejores
- Si no hay descuentos para lo pedido → decilo y sugerí alternativas
- No inventes descuentos que no estén en la lista
- ${formatoLinea}

DESCUENTOS ACTIVOS (${descuentos.length} total):
${lista}`;
}

// ── Historial por sesión ──────────────────────────────────────────────────────
const historialSesiones = new Map();
const MAX_HISTORIAL = 10;

function obtenerHistorial(sessionId) {
    return historialSesiones.get(sessionId) || [];
}

function actualizarHistorial(sessionId, role, content) {
    const hist = obtenerHistorial(sessionId);
    hist.push({ role, content });
    if (hist.length > MAX_HISTORIAL) hist.splice(0, hist.length - MAX_HISTORIAL);
    historialSesiones.set(sessionId, hist);
    if (historialSesiones.size > 1000) {
        historialSesiones.delete([...historialSesiones.keys()][0]);
    }
}

// ── Fallback sin IA (cuando ambos servicios fallan) ──────────────────────────
function respuestaFallback(userName, totalDescuentos) {
    const saludo = userName ? `¡Hola ${userName}! 👋` : '¡Hola! 👋';
    return `${saludo} Soy el asistente de *Ahorro Inteligente*.\n\n` +
        `Tenemos *${totalDescuentos} descuentos* activos. El asistente IA está momentáneamente fuera de servicio.\n\n` +
        `*Escribí alguna de estas palabras para buscar:*\n` +
        `• supermercado\n• combustible\n• farmacia\n• restaurante\n• banco\n• fintech\n\n` +
        `También podés ver todos los descuentos en:\n` +
        `🌐 https://ahorrointeligente-ai.onrender.com`;
}

// ── Llamada a Groq ────────────────────────────────────────────────────────────
async function llamarGroq(systemPrompt, historial) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY no configurada');

    const client = new Groq({ apiKey });
    const messages = [
        { role: 'system', content: systemPrompt },
        ...historial,
    ];

    const res = await client.chat.completions.create({
        model: GROQ_MODEL,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
    });

    return res.choices[0].message.content;
}

// ── Llamada a Claude ──────────────────────────────────────────────────────────
async function llamarClaude(systemPrompt, historial) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY no configurada');

    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: historial,
    });

    return res.content[0].text;
}

// ── Función principal ─────────────────────────────────────────────────────────
async function responderChat(mensaje, sessionId = 'default', userName = '', canal = 'whatsapp') {
    // Cargar descuentos
    let descuentos;
    try {
        descuentos = await fetchDescuentos();
    } catch {
        return { respuesta: '⚠️ No pude cargar los descuentos ahora. Intentá de nuevo en unos segundos.', ok: false };
    }

    const systemPrompt = buildSystemPrompt(descuentos, userName, canal);

    // Agregar mensaje del usuario al historial
    actualizarHistorial(sessionId, 'user', mensaje);
    const historial = obtenerHistorial(sessionId);

    let respuesta = null;
    let proveedor = null;

    // 1. Intentar con Groq
    if (process.env.GROQ_API_KEY) {
        try {
            respuesta = await llamarGroq(systemPrompt, historial);
            proveedor = 'groq';
        } catch (err) {
            console.warn(`⚠️ Groq falló: ${err.message} — intentando Claude...`);
        }
    }

    // 2. Intentar con Claude si Groq falló
    if (!respuesta && process.env.ANTHROPIC_API_KEY) {
        try {
            respuesta = await llamarClaude(systemPrompt, historial);
            proveedor = 'claude';
        } catch (err) {
            console.warn(`⚠️ Claude también falló: ${err.message} — usando fallback básico`);
        }
    }

    // 3. Fallback sin IA
    if (!respuesta) {
        respuesta = respuestaFallback(userName, descuentos.length);
        return { respuesta, ok: false };
    }

    console.log(`✅ Respuesta generada por: ${proveedor}`);

    // Guardar respuesta del asistente en el historial
    actualizarHistorial(sessionId, 'assistant', respuesta);

    return { respuesta, ok: true, proveedor };
}

module.exports = { responderChat };
