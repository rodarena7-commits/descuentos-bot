const logger = require('../utils/logger');

const DESCUENTOS_HSBC = [
    {
        id: 'hsbc-viajes-001',
        banco: 'HSBC',
        descuento: '20%',
        monto: '5000',
        cashback: '',
        categoria: 'Viajes',
        validoHasta: '2026-09-30',
        requisitos: 'Tarjeta crédito HSBC. En agencias de viajes adheridas',
        url: 'https://www.hsbc.com.ar',
        medioPago: 'Crédito'
    },
    {
        id: 'hsbc-supermercados-001',
        banco: 'HSBC',
        descuento: '15%',
        monto: '2000',
        cashback: '',
        categoria: 'Supermercados',
        validoHasta: '2026-08-31',
        requisitos: 'Tarjeta Select HSBC. En Carrefour e Hipermercados',
        url: 'https://www.hsbc.com.ar',
        medioPago: 'Crédito'
    },
    {
        id: 'hsbc-entretenimiento-001',
        banco: 'HSBC',
        descuento: '25%',
        monto: '1500',
        cashback: '',
        categoria: 'Entretenimiento',
        validoHasta: '2026-10-31',
        requisitos: 'En cines, teatros. Máximo $1500 descuento',
        url: 'https://www.hsbc.com.ar',
        medioPago: 'Crédito'
    }
];

async function scrapingHSBC() {
    logger.info('      🏦 HSBC');
    return DESCUENTOS_HSBC;
}

module.exports = {
    scraping: scrapingHSBC,
    nombre: 'HSBC'
};
