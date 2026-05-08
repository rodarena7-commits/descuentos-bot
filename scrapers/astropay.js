const logger = require('../utils/logger');

const DESCUENTOS_ASTROPAY = [
    {
        id: 'astropay-compras-001',
        banco: 'Astropay',
        descuento: '8%',
        monto: '3000',
        cashback: '',
        categoria: 'Compras Online',
        validoHasta: '2026-07-31',
        requisitos: 'En tiendas online adheridas. Máximo $3000',
        url: 'https://www.astropay.com/ar',
        medioPago: 'Tarjeta Astropay'
    },
    {
        id: 'astropay-gaming-001',
        banco: 'Astropay',
        descuento: '10%',
        monto: '2000',
        cashback: '',
        categoria: 'Gaming y Entretenimiento',
        validoHasta: '2026-09-30',
        requisitos: 'Plataformas gaming. Máximo $2000',
        url: 'https://www.astropay.com/ar',
        medioPago: 'Tarjeta Astropay'
    }
];

async function scrapingAstropay() {
    logger.info('      🚀 Astropay');
    return DESCUENTOS_ASTROPAY;
}

module.exports = {
    scraping: scrapingAstropay,
    nombre: 'Astropay'
};
