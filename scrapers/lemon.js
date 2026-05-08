const logger = require('../utils/logger');

const DESCUENTOS_LEMON = [
    {
        id: 'lemon-netflix-001',
        banco: 'Lemon',
        descuento: '50%',
        monto: '400',
        cashback: '',
        categoria: 'Suscripciones',
        validoHasta: '2026-07-31',
        requisitos: 'Usuario con cuenta en Lemon. Primer mes',
        url: 'https://www.lemon.me',
        medioPago: 'Billetera Lemon'
    },
    {
        id: 'lemon-compras-001',
        banco: 'Lemon',
        descuento: '5%',
        monto: '1000',
        cashback: '10%',
        categoria: 'Compras Online',
        validoHasta: '2026-09-30',
        requisitos: 'Cashback en tiendas seleccionadas',
        url: 'https://www.lemon.me',
        medioPago: 'Billetera Lemon'
    },
    {
        id: 'lemon-seguros-001',
        banco: 'Lemon',
        descuento: '30%',
        monto: '5000',
        cashback: '',
        categoria: 'Seguros',
        validoHasta: '2026-08-31',
        requisitos: 'Seguros de auto y hogar. Válido 3 meses',
        url: 'https://www.lemon.me',
        medioPago: 'Billetera Lemon'
    }
];

async function scrapingLemon() {
    logger.info('      🍋 Lemon');
    return DESCUENTOS_LEMON;
}

module.exports = {
    scraping: scrapingLemon,
    nombre: 'Lemon'
};
