const logger = require('../utils/logger');

const DESCUENTOS_CUENTA_DNI = [
    {
        id: 'cuentadni-farmacia-001',
        banco: 'Cuenta DNI',
        descuento: '20%',
        monto: '1500',
        cashback: '',
        categoria: 'Farmacia',
        validoHasta: '2026-07-31',
        requisitos: 'Compra en farmacias adheridas. Máximo $1500',
        url: 'https://www.cuentadni.gob.ar',
        medioPago: 'Tarjeta Cuenta DNI'
    },
    {
        id: 'cuentadni-transporte-001',
        banco: 'Cuenta DNI',
        descuento: '30%',
        monto: '600',
        cashback: '',
        categoria: 'Transporte',
        validoHasta: '2026-08-31',
        requisitos: 'SUBE, Uber, taxis. Máximo $600/mes',
        url: 'https://www.cuentadni.gob.ar',
        medioPago: 'Tarjeta Cuenta DNI'
    },
    {
        id: 'cuentadni-supermercado-001',
        banco: 'Cuenta DNI',
        descuento: '15%',
        monto: '2000',
        cashback: '',
        categoria: 'Supermercados',
        validoHasta: '2026-06-30',
        requisitos: 'Día %: descuento adicional. Máximo $2000',
        url: 'https://www.cuentadni.gob.ar',
        medioPago: 'Tarjeta Cuenta DNI'
    }
];

async function scrapingCuentaDNI() {
    logger.info('      📱 Cuenta DNI');
    return DESCUENTOS_CUENTA_DNI;
}

module.exports = {
    scraping: scrapingCuentaDNI,
    nombre: 'Cuenta DNI'
};
