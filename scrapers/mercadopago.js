const logger = require('../utils/logger');

const DESCUENTOS_MERCADO_PAGO = [
    {
        id: 'mp-supermercados-001',
        banco: 'Mercado Pago',
        descuento: '10%',
        monto: '2000',
        cashback: '',
        categoria: 'Supermercados',
        validoHasta: '2026-06-30',
        requisitos: 'Pagar con Mercado Pago. Compra mínima $300',
        url: 'https://www.mercadopago.com.ar',
        medioPago: 'Billetera Digital'
    },
    {
        id: 'mp-uber-001',
        banco: 'Mercado Pago',
        descuento: '20%',
        monto: '500',
        cashback: '',
        categoria: 'Transporte',
        validoHasta: '2026-07-31',
        requisitos: 'Código exclusivo en Uber. Máximo $500',
        url: 'https://www.mercadopago.com.ar',
        medioPago: 'Billetera Digital'
    },
    {
        id: 'mp-spotify-001',
        banco: 'Mercado Pago',
        descuento: '3 meses gratis',
        monto: '900',
        cashback: '',
        categoria: 'Suscripciones',
        validoHasta: '2026-08-31',
        requisitos: 'Primera vez en Spotify. Pagar con MP',
        url: 'https://www.mercadopago.com.ar',
        medioPago: 'Billetera Digital'
    },
    {
        id: 'mp-fashion-001',
        banco: 'Mercado Pago',
        descuento: '15%',
        monto: '3000',
        cashback: '',
        categoria: 'Ropa y Accesorios',
        validoHasta: '2026-07-15',
        requisitos: 'En tiendas adheridas. Compra mínima $500',
        url: 'https://www.mercadopago.com.ar',
        medioPago: 'Billetera Digital'
    }
];

async function scrapingMercadoPago() {
    logger.info('      📱 Mercado Pago');
    return DESCUENTOS_MERCADO_PAGO;
}

module.exports = {
    scraping: scrapingMercadoPago,
    nombre: 'Mercado Pago'
};
