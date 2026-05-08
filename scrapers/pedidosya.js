const logger = require('../utils/logger');

const DESCUENTOS_PEDIDOSYA = [
    {
        id: 'pedidosya-primera-orden-001',
        banco: 'PedidosYa',
        descuento: 'Gratis',
        monto: '5000',
        cashback: '',
        categoria: 'Delivery',
        validoHasta: '2026-12-31',
        requisitos: 'Primera orden gratis hasta $5000. Código PYGRATIS',
        url: 'https://www.pedidosya.com.ar',
        medioPago: 'Cualquiera'
    },
    {
        id: 'pedidosya-mercadopago-001',
        banco: 'PedidosYa',
        descuento: '15%',
        monto: '2000',
        cashback: '',
        categoria: 'Restaurantes',
        validoHasta: '2026-08-31',
        requisitos: 'Con Mercado Pago. Máximo $2000 descuento',
        url: 'https://www.pedidosya.com.ar',
        medioPago: 'Billetera Digital'
    },
    {
        id: 'pedidosya-fines-semana-001',
        banco: 'PedidosYa',
        descuento: 'Envío gratis',
        monto: '500',
        cashback: '',
        categoria: 'Delivery',
        validoHasta: '2026-09-30',
        requisitos: 'Viernes a domingo. Compra mínima $800',
        url: 'https://www.pedidosya.com.ar',
        medioPago: 'Cualquiera'
    }
];

async function scrapingPedidosYa() {
    logger.info('      📱 PedidosYa');
    return DESCUENTOS_PEDIDOSYA;
}

module.exports = {
    scraping: scrapingPedidosYa,
    nombre: 'PedidosYa'
};
