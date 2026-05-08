const logger = require('../utils/logger');

const DESCUENTOS_ICBC = [
    {
        id: 'icbc-supermercado-001',
        banco: 'ICBC',
        descuento: '15%',
        monto: '2500',
        cashback: '',
        categoria: 'Supermercados',
        validoHasta: '2026-08-31',
        requisitos: 'Tarjeta débito ICBC. En Carrefour, Día%, Jumbo',
        url: 'https://www.icbc.com.ar',
        medioPago: 'Débito'
    },
    {
        id: 'icbc-gastronomia-001',
        banco: 'ICBC',
        descuento: '20%',
        monto: '2000',
        cashback: '',
        categoria: 'Gastronomía',
        validoHasta: '2026-09-30',
        requisitos: 'Tarjeta crédito ICBC. En restaurantes adheridos',
        url: 'https://www.icbc.com.ar',
        medioPago: 'Crédito'
    },
    {
        id: 'icbc-combustible-001',
        banco: 'ICBC',
        descuento: '10%',
        monto: '1000',
        cashback: '',
        categoria: 'Combustible',
        validoHasta: '2026-10-31',
        requisitos: 'Tarjeta débito o crédito. En estaciones YPF',
        url: 'https://www.icbc.com.ar',
        medioPago: 'Débito/Crédito'
    }
];

async function scrapingICBC() {
    logger.info('      🏪 ICBC');
    return DESCUENTOS_ICBC;
}

module.exports = {
    scraping: scrapingICBC,
    nombre: 'ICBC'
};
