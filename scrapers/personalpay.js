const logger = require('../utils/logger');

const DESCUENTOS_PERSONAL_PAY = [
    {
        id: 'personalpay-compras-001',
        banco: 'Personal Pay',
        descuento: '12%',
        monto: '2500',
        cashback: '3%',
        categoria: 'Compras Online',
        validoHasta: '2026-08-31',
        requisitos: 'Billetera Personal Pay. Compra mínima $200',
        url: 'https://www.personalpay.com.ar',
        medioPago: 'Billetera Personal Pay'
    },
    {
        id: 'personalpay-prestamos-001',
        banco: 'Personal Pay',
        descuento: 'TNA desde 35%',
        monto: '100000',
        cashback: '',
        categoria: 'Préstamos',
        validoHasta: '2026-12-31',
        requisitos: 'Clientes nuevos. Sin garantía',
        url: 'https://www.personalpay.com.ar',
        medioPago: 'Préstamos Personal Pay'
    }
];

async function scrapingPersonalPay() {
    logger.info('      💰 Personal Pay');
    return DESCUENTOS_PERSONAL_PAY;
}

module.exports = {
    scraping: scrapingPersonalPay,
    nombre: 'Personal Pay'
};
