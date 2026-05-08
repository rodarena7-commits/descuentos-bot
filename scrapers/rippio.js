const logger = require('../utils/logger');

async function scrapingRippio() {
    // TODO: Implementar scraping de Rippio
    // https://www.rippio.com/promociones

    logger.info('      💱 Rippio (pendiente implementación)');
    return [];
}

module.exports = {
    scraping: scrapingRippio,
    nombre: 'Rippio'
};
