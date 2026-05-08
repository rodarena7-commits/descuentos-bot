const axios = require('axios');
const logger = require('../utils/logger');

async function scrapingMercadoPago() {
    // TODO: Implementar scraping de Mercado Pago
    // Mercado Pago tiene API pero también página de promociones
    // https://www.mercadopago.com.ar/beneficios

    logger.info('      📱 Mercado Pago (pendiente implementación)');

    // Por ahora retornar array vacío
    return [];
}

module.exports = {
    scraping: scrapingMercadoPago,
    nombre: 'Mercado Pago'
};
