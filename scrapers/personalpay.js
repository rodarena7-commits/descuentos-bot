const logger = require('../utils/logger');

async function scrapingPersonalPay() {
    // TODO: Implementar scraping de Personal Pay
    // https://www.personalpay.com.ar/beneficios

    logger.info('      💰 Personal Pay (pendiente implementación)');
    return [];
}

module.exports = {
    scraping: scrapingPersonalPay,
    nombre: 'Personal Pay'
};
