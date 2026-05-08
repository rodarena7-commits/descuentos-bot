const logger = require('../utils/logger');

const DESCUENTOS_MERCADO_LIBRE = [
    {
        id: 'ml-electrodomesticos-001',
        banco: 'Mercado Libre',
        descuento: '25%',
        monto: '5000',
        cashback: '5%',
        categoria: 'Electrónica',
        validoHasta: '2026-06-15',
        requisitos: 'Envío gratis. Cupón PROMO25',
        url: 'https://www.mercadolibre.com.ar',
        medioPago: 'Cualquiera'
    },
    {
        id: 'ml-muebles-001',
        banco: 'Mercado Libre',
        descuento: '30%',
        monto: '6000',
        cashback: '',
        categoria: 'Muebles',
        validoHasta: '2026-07-31',
        requisitos: 'En muebles seleccionados. Cupón MUEBLES30',
        url: 'https://www.mercadolibre.com.ar',
        medioPago: 'Cualquiera'
    },
    {
        id: 'ml-deportes-001',
        banco: 'Mercado Libre',
        descuento: '20%',
        monto: '2000',
        cashback: '',
        categoria: 'Deportes',
        validoHasta: '2026-08-10',
        requisitos: 'Artículos deportivos. Cupón SPORT20',
        url: 'https://www.mercadolibre.com.ar',
        medioPago: 'Cualquiera'
    }
];

async function scrapingMercadoLibre() {
    logger.info('      📦 Mercado Libre');
    return DESCUENTOS_MERCADO_LIBRE;
}

module.exports = {
    scraping: scrapingMercadoLibre,
    nombre: 'Mercado Libre'
};
