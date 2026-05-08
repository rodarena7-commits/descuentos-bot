const cron = require('cron');
const logger = require('../utils/logger');
const scrapersIndex = require('../scrapers/index');
const notificador = require('./notificador');
const fs = require('fs');
const path = require('path');

let tareaScheduled = null;

// ============================================================
// EJECUTAR SCRAPING Y ENVIAR NOTIFICACIONES
// ============================================================
async function ejecutarScrapingAutomatico(sock, numeroCanal) {
    logger.info('🔄 Iniciando scraping automático...');

    try {
        // Ejecutar todos los scrapers
        const resultado = await scrapersIndex.ejecutarTodosScraping();

        // Filtrar descuentos vencidos
        const descuentosActivos = scrapersIndex.filtrarDescuentosActivos(resultado.descuentos);

        logger.info(`📊 Total descuentos encontrados: ${descuentosActivos.length}`);

        // Guardar descuentos en JSON
        const archivoDescuentos = path.join(__dirname, '../data/descuentos.json');
        fs.writeFileSync(archivoDescuentos, JSON.stringify(descuentosActivos, null, 2));

        // Detectar descuentos nuevos
        const nuevos = notificador.detectarDescuentosNuevos(descuentosActivos);

        if (nuevos.length > 0) {
            logger.info(`🎁 ${nuevos.length} descuentos NUEVOS detectados`);

            // Enviar notificación al canal
            if (sock && numeroCanal) {
                await notificador.enviarNotificacionAlCanal(sock, numeroCanal, nuevos);
            }
        } else {
            logger.info('ℹ️ No hay descuentos nuevos desde la última actualización');
        }

        // Limpiar descuentos vencidos del registro
        notificador.limpiarEnviados();

        return {
            exito: true,
            totalDescuentos: descuentosActivos.length,
            nuevos: nuevos.length,
            errores: resultado.errores
        };
    } catch (error) {
        logger.error(`❌ Error en scraping automático: ${error.message}`);
        return {
            exito: false,
            error: error.message
        };
    }
}

// ============================================================
// CREAR SCHEDULE PARA EJECUTAR CADA X HORAS
// ============================================================
function crearSchedule(sock, numeroCanal, intervalHoras = 6) {
    // Cron: ejecutar cada 6 horas (0 */6 * * *)
    // 0 = minuto 0
    // */6 = cada 6 horas
    // * = cada día
    // * = cada mes
    // * = cada día de la semana
    const cronExpression = `0 */${intervalHoras} * * *`;

    logger.info(`⏰ Creando schedule de scraping cada ${intervalHoras} horas`);

    tareaScheduled = cron.schedule(cronExpression, async () => {
        logger.info('▶️ Ejecutando scraping programado...');
        const resultado = await ejecutarScrapingAutomatico(sock, numeroCanal);

        if (resultado.exito) {
            logger.info(`✅ Scraping completado: ${resultado.totalDescuentos} descuentos, ${resultado.nuevos} nuevos`);
        }
    });

    // También ejecutar inmediatamente al iniciar
    logger.info('📤 Ejecutando scraping inicial...');
    ejecutarScrapingAutomatico(sock, numeroCanal);

    logger.info('✅ Schedule activado');
}

function detenerSchedule() {
    if (tareaScheduled) {
        tareaScheduled.stop();
        logger.info('⏹️ Schedule detenido');
    }
}

module.exports = {
    ejecutarScrapingAutomatico,
    crearSchedule,
    detenerSchedule
};
