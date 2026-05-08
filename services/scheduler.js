const cron = require('cron');
const logger = require('../utils/logger');
const scrapersIndex = require('../scrapers/index');
const notificador = require('./notificador');
const fs = require('fs');
const path = require('path');

let tareaScheduled = null;
let ultimoEnvioCompleto = 0; // Timestamp del último envío de todos los descuentos
const INTERVALO_ENVIO_COMPLETO = 24 * 60 * 60 * 1000; // 24 horas en ms

// ============================================================
// EJECUTAR SCRAPING Y ENVIAR NOTIFICACIONES
// ============================================================
async function ejecutarScrapingAutomatico(sock, numeroCanal, onDescuentosActualizados) {
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

        // Notificar a server.js para que recargue los descuentos en memoria
        if (typeof onDescuentosActualizados === 'function') {
            onDescuentosActualizados(descuentosActivos);
        }

        // Detectar descuentos nuevos
        const nuevos = notificador.detectarDescuentosNuevos(descuentosActivos);

        if (nuevos.length > 0) {
            logger.info(`🎁 ${nuevos.length} descuentos NUEVOS detectados - Enviando inmediatamente`);
            if (sock && numeroCanal) {
                await notificador.enviarNotificacionAlCanal(sock, numeroCanal, nuevos);
                ultimoEnvioCompleto = Date.now();
            }
        } else {
            // No hay nuevos. Revisar si ya pasaron 24 horas desde el último envío completo
            const tiempoTranscurrido = Date.now() - ultimoEnvioCompleto;

            if (tiempoTranscurrido >= INTERVALO_ENVIO_COMPLETO) {
                logger.info(`📢 24 horas sin envío. Enviando TODOS los ${descuentosActivos.length} descuentos activos`);
                if (sock && numeroCanal && descuentosActivos.length > 0) {
                    await notificador.enviarNotificacionAlCanal(sock, numeroCanal, descuentosActivos);
                    ultimoEnvioCompleto = Date.now();
                }
            } else {
                const horasRestantes = Math.ceil((INTERVALO_ENVIO_COMPLETO - tiempoTranscurrido) / (60 * 60 * 1000));
                logger.info(`ℹ️ Sin cambios. Próximo envío de todos los descuentos en ${horasRestantes}h`);
            }
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
function crearSchedule(sock, numeroCanal, intervalMinutos = 30, onDescuentosActualizados) {
    // Cron: ejecutar cada X minutos
    // */30 = cada 30 minutos
    const cronExpression = `*/${intervalMinutos} * * * *`;

    logger.info(`⏰ Creando schedule de scraping cada ${intervalMinutos} minutos`);

    tareaScheduled = new cron.CronJob(cronExpression, async () => {
        logger.info('▶️ Ejecutando scraping programado...');
        const resultado = await ejecutarScrapingAutomatico(sock, numeroCanal, onDescuentosActualizados);

        if (resultado.exito) {
            logger.info(`✅ Scraping completado: ${resultado.totalDescuentos} descuentos, ${resultado.nuevos} nuevos`);
        }
    });

    tareaScheduled.start();

    // También ejecutar inmediatamente al iniciar
    logger.info('📤 Ejecutando scraping inicial...');
    ejecutarScrapingAutomatico(sock, numeroCanal, onDescuentosActualizados);

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
