const logger = require('../utils/logger');

const DESCUENTOS_RAPPI = [
    {
        id: 'rappi-bienvenida-001',
        banco: 'Rappi',
        descuento: '40%',
        monto: '3000',
        cashback: '',
        categoria: 'Delivery',
        validoHasta: '2026-12-31',
        requisitos: 'Primera orden con código RAPPI40. Máximo $3000 de descuento',
        url: 'https://www.rappi.com.ar',
        medioPago: 'Billetera Rappi'
    },
    {
        id: 'rappi-restaurantes-001',
        banco: 'Rappi',
        descuento: '20%',
        monto: '2000',
        cashback: '',
        categoria: 'Gastronomía',
        validoHasta: '2026-08-31',
        requisitos: 'En restaurantes seleccionados. Máximo $2000 descuento',
        url: 'https://www.rappi.com.ar',
        medioPago: 'Billetera Rappi'
    },
    {
        id: 'rappi-envios-001',
        banco: 'Rappi',
        descuento: 'Envío gratis',
        monto: '500',
        cashback: '',
        categoria: 'Compras Online',
        validoHasta: '2026-09-30',
        requisitos: 'En compras mayores a $1000. Compras Premium',
        url: 'https://www.rappi.com.ar',
        medioPago: 'Billetera Rappi'
    }
];

async function scrapingRappi() {
    logger.info('      🚗 Rappi');
    return DESCUENTOS_RAPPI;
}

module.exports = {
    scraping: scrapingRappi,
    nombre: 'Rappi'
};
