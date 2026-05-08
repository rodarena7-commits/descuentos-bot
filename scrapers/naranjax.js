const logger = require('../utils/logger');

const DESCUENTOS_NARANJAX = [
    {
        id: 'naranjax-supermercado-001',
        banco: 'NaranjaX',
        descuento: '20%',
        monto: '3000',
        cashback: '',
        categoria: 'Supermercados',
        validoHasta: '2026-07-31',
        requisitos: 'En Carrefour y Día%. Máximo $3000 descuento',
        url: 'https://www.naranjax.com',
        medioPago: 'Tarjeta NaranjaX'
    },
    {
        id: 'naranjax-gastronomia-001',
        banco: 'NaranjaX',
        descuento: '30%',
        monto: '2500',
        cashback: '',
        categoria: 'Gastronomía',
        validoHasta: '2026-08-31',
        requisitos: 'McDonald\'s, Burger King, Mostaza. Máximo $2500',
        url: 'https://www.naranjax.com',
        medioPago: 'Tarjeta NaranjaX'
    },
    {
        id: 'naranjax-combustible-001',
        banco: 'NaranjaX',
        descuento: '15%',
        monto: '1500',
        cashback: '',
        categoria: 'Combustible',
        validoHasta: '2026-09-30',
        requisitos: 'En estaciones YPF y Axion. Máximo $1500',
        url: 'https://www.naranjax.com',
        medioPago: 'Tarjeta NaranjaX'
    },
    {
        id: 'naranjax-entretenimiento-001',
        banco: 'NaranjaX',
        descuento: '25%',
        monto: '2000',
        cashback: '',
        categoria: 'Entretenimiento',
        validoHasta: '2026-10-31',
        requisitos: 'Cines, teatros. Máximo $2000 descuento',
        url: 'https://www.naranjax.com',
        medioPago: 'Tarjeta NaranjaX'
    }
];

async function scrapingNaranjaX() {
    logger.info('      🟠 NaranjaX');
    return DESCUENTOS_NARANJAX;
}

module.exports = {
    scraping: scrapingNaranjaX,
    nombre: 'NaranjaX'
};
