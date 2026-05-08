const logger = require('../utils/logger');

async function scrapingCuentaDNI() {
    // TODO: Implementar scraping de Cuenta DNI
    // https://www.cuentadni.gob.ar/beneficios

    logger.info('      📱 Cuenta DNI (pendiente implementación)');
    return [];
}

module.exports = {
    scraping: scrapingCuentaDNI,
    nombre: 'Cuenta DNI'
};
