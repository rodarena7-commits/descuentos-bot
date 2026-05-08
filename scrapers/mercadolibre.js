const logger = require('../utils/logger');

async function scrapingMercadoLibre() {
    // TODO: Implementar scraping de Mercado Libre
    // https://www.mercadolibre.com.ar/promociones

    logger.info('      📦 Mercado Libre (pendiente implementación)');
    return [];
}

module.exports = {
    scraping: scrapingMercadoLibre,
    nombre: 'Mercado Libre'
};
