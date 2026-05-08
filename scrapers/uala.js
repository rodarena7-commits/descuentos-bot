const logger = require('../utils/logger');

const DESCUENTOS_UALA = [
    {
        id: 'uala-cashback-001',
        banco: 'Ualá',
        descuento: 'Cashback 5%',
        monto: '2000',
        cashback: '5%',
        categoria: 'Compras Online',
        validoHasta: '2026-12-31',
        requisitos: 'En todas las compras con tarjeta Ualá. Sin límite',
        url: 'https://www.uala.com.ar',
        medioPago: 'Billetera Ualá'
    },
    {
        id: 'uala-farmacia-001',
        banco: 'Ualá',
        descuento: '15%',
        monto: '1500',
        cashback: '',
        categoria: 'Salud y Farmacia',
        validoHasta: '2026-08-31',
        requisitos: 'En farmacias adheridas. Máximo $1500 descuento',
        url: 'https://www.uala.com.ar',
        medioPago: 'Billetera Ualá'
    },
    {
        id: 'uala-envios-001',
        banco: 'Ualá',
        descuento: 'Envío gratis',
        monto: '500',
        cashback: '',
        categoria: 'Compras Online',
        validoHasta: '2026-09-30',
        requisitos: 'En tiendas partner. Compra mínima $500',
        url: 'https://www.uala.com.ar',
        medioPago: 'Billetera Ualá'
    }
];

async function scrapingUala() {
    logger.info('      💜 Ualá');
    return DESCUENTOS_UALA;
}

module.exports = {
    scraping: scrapingUala,
    nombre: 'Ualá'
};
