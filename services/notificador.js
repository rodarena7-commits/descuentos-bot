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
// ENVIAR NOTIFICACIÓN AL CANAL
// ============================================================
async function enviarNotificacionAlCanal(sock, numeroCanal, descuentosNuevos) {
    if (descuentosNuevos.length === 0) {
        logger.info('📭 No hay descuentos nuevos para notificar');
        return;
    }

    try {
        // Agrupar por banco para mejor lectura
        const mensaje = formatearListaDescuentos(descuentosNuevos);

        // Enviar al canal
        await sock.sendMessage(numeroCanal, { text: mensaje });

        logger.info(`✅ Notificación enviada al canal: ${descuentosNuevos.length} descuentos nuevos`);
        return true;
    } catch (error) {
        logger.error(`❌ Error enviando notificación: ${error.message}`);
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
