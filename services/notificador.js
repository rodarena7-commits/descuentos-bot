const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { formatearListaDescuentos } = require('../utils/formatters');

// ============================================================
// ALMACENAMIENTO DE DESCUENTOS YA ENVIADOS
// ============================================================
const ARCHIVO_ENVIADOS = path.join(__dirname, '../data/descuentos_enviados.json');

function cargarDescuentosEnviados() {
    if (fs.existsSync(ARCHIVO_ENVIADOS)) {
        const contenido = fs.readFileSync(ARCHIVO_ENVIADOS, 'utf8');
        return JSON.parse(contenido);
    }
    return {};
}

function guardarDescuentosEnviados(descuentosEnviados) {
    fs.writeFileSync(ARCHIVO_ENVIADOS, JSON.stringify(descuentosEnviados, null, 2));
}

// ============================================================
// DETECTAR DESCUENTOS NUEVOS
// ============================================================
function detectarDescuentosNuevos(descuentosActuales) {
    const enviados = cargarDescuentosEnviados();
    const nuevos = [];

    descuentosActuales.forEach(descuento => {
        // Si el ID no existe en descuentos enviados, es nuevo
        if (!enviados[descuento.id]) {
            nuevos.push(descuento);

            // Marcar como enviado
            enviados[descuento.id] = {
                fecha: new Date().toISOString(),
                descuento: descuento
            };
        }
    });

    // Guardar actualización
    guardarDescuentosEnviados(enviados);

    return nuevos;
}

// ============================================================
// DIVIDIR DESCUENTOS EN LOTES PARA EVITAR SPAM
// ============================================================
function dividirDescuentosEnLotes(descuentos, descuentosPorLote = 10) {
    const lotes = [];
    for (let i = 0; i < descuentos.length; i += descuentosPorLote) {
        lotes.push(descuentos.slice(i, i + descuentosPorLote));
    }
    return lotes;
}

// ============================================================
// ENVIAR NOTIFICACIÓN AL CANAL
// ============================================================
async function enviarNotificacionAlCanal(sock, numeroCanal, descuentosNuevos, intentos = 3) {
    if (descuentosNuevos.length === 0) {
        logger.info('📭 No hay descuentos nuevos para notificar');
        return;
    }

    // Validar formato del canal
    if (!numeroCanal || typeof numeroCanal !== 'string') {
        logger.error(`❌ ID del canal inválido: ${numeroCanal}`);
        return false;
    }

    // Verificar estado del socket
    if (!sock || !sock.sendMessage || typeof sock.sendMessage !== 'function') {
        logger.error('❌ Socket no disponible o no tiene método sendMessage');
        return false;
    }

    try {
        logger.info(`📤 Intentando enviar al canal ${numeroCanal}...`);

        // Dividir descuentos en lotes pequeños para evitar spam de WhatsApp
        const lotes = dividirDescuentosEnLotes(descuentosNuevos, 10);
        logger.info(`📦 Se enviarán ${lotes.length} mensajes con ${descuentosNuevos.length} descuentos totales`);

        let totalEnviados = 0;

        for (let loteIdx = 0; loteIdx < lotes.length; loteIdx++) {
            const lote = lotes[loteIdx];
            const mensaje = formatearListaDescuentos(lote);
            const numeroLote = loteIdx + 1;
            const totalLotes = lotes.length;

            const mensajeConInfo = totalLotes > 1
                ? `Parte ${numeroLote}/${totalLotes}\n\n${mensaje}`
                : mensaje;

            let enviado = false;
            let ultimoError = null;

            for (let i = 0; i < intentos; i++) {
                try {
                    logger.info(`📨 Enviando lote ${numeroLote}/${totalLotes} (intento ${i + 1}/${intentos})...`);
                    const result = await sock.sendMessage(numeroCanal, { text: mensajeConInfo });
                    logger.info(`✅ Lote ${numeroLote} enviado exitosamente`);
                    totalEnviados += lote.length;
                    enviado = true;
                    break;
                } catch (error) {
                    ultimoError = error;
                    logger.warn(`⚠️ Lote ${numeroLote}, intento ${i + 1} falló: ${error.message}`);

                    if (i < intentos - 1) {
                        // Esperar 2 segundos antes de reintentar
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }

            if (!enviado) {
                const errMsg = ultimoError?.message || '';
                if (errMsg.includes('forbidden') || errMsg.includes('not-authorized')) {
                    logger.error(`❌ FORBIDDEN: El bot no tiene permiso para enviar al canal ${numeroCanal}`);
                    logger.error(`📋 SOLUCIÓN: Abrí el grupo en WhatsApp → Configuración del grupo → Agregar al bot como ADMINISTRADOR`);
                    logger.error(`📋 O bien: Creá un grupo nuevo, agregá el bot, hacelo admin, y actualizá CANAL_ID en Render con el nuevo ID.`);
                } else {
                    logger.error(`❌ No se pudo enviar lote ${numeroLote}. Error: ${errMsg}`);
                }
                return false;
            }

            // Esperar 1 segundo entre lotes para no parecer spam
            if (loteIdx < lotes.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        logger.info(`✅ Notificación enviada al canal: ${totalEnviados} descuentos en ${lotes.length} mensajes`);
        return true;
    } catch (error) {
        logger.error(`❌ Error inesperado en enviarNotificacionAlCanal: ${error.message}`);
        logger.error(`📋 Stack trace: ${error.stack}`);
        return false;
    }
}

// ============================================================
// LIMPIAR DESCUENTOS VENCIDOS DE ENVIADOS
// ============================================================
function limpiarEnviados() {
    const enviados = cargarDescuentosEnviados();
    const hoy = new Date().toISOString().split('T')[0];
    const antes = Object.keys(enviados).length;

    const limpios = {};
    Object.entries(enviados).forEach(([id, data]) => {
        if (data.descuento.validoHasta >= hoy) {
            limpios[id] = data;
        }
    });

    guardarDescuentosEnviados(limpios);
    const eliminados = antes - Object.keys(limpios).length;

    if (eliminados > 0) {
        logger.info(`🧹 ${eliminados} descuentos vencidos removidos del registro`);
    }

    return eliminados;
}

module.exports = {
    detectarDescuentosNuevos,
    enviarNotificacionAlCanal,
    limpiarEnviados,
    cargarDescuentosEnviados,
    guardarDescuentosEnviados
};
