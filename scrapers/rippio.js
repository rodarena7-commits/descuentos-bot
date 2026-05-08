const logger = require('../utils/logger');

const DESCUENTOS_RIPPIO = [
    {
        id: 'rippio-cripto-001',
        banco: 'Rippio',
        descuento: '2%',
        monto: '5000',
        cashback: 'En criptos',
        categoria: 'Cripto/Finanzas',
        validoHasta: '2026-12-31',
        requisitos: 'Compra venta de criptomonedas. Sin límite',
        url: 'https://www.rippio.com',
        medioPago: 'Billetera Rippio'
    },
    {
        id: 'rippio-remesas-001',
        banco: 'Rippio',
        descuento: '1%',
        monto: '10000',
        cashback: '',
        categoria: 'Remesas',
        validoHasta: '2026-08-31',
        requisitos: 'Envíos internacionales. Sin límite',
        url: 'https://www.rippio.com',
        medioPago: 'Billetera Rippio'
    }
];

async function scrapingRippio() {
    logger.info('      💱 Rippio');
    return DESCUENTOS_RIPPIO;
}

module.exports = {
    scraping: scrapingRippio,
    nombre: 'Rippio'
};
