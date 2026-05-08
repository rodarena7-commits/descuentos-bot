const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

// Descuentos hardcodeados basados en búsqueda manual
// En producción, estos serían scrapeados dinámicamente
const DESCUENTOS_BANCOS = [
    {
        id: 'bbva-supermercados-001',
        banco: 'BBVA',
        descuento: '15%',
        monto: '3000',
        cashback: '',
        categoria: 'Supermercados',
        validoHasta: '2026-06-30',
        requisitos: 'Tarjeta débito BBVA. Compra mínima $500',
        url: 'https://www.bbvaargentina.com',
        medioPago: 'Débito'
    },
    {
        id: 'bbva-cine-001',
        banco: 'BBVA',
        descuento: '20%',
        monto: '500',
        cashback: '',
        categoria: 'Entretenimiento',
        validoHasta: '2026-07-15',
        requisitos: 'Tarjeta crédito BBVA. Válido en cines seleccionados',
        url: 'https://www.bbvaargentina.com',
        medioPago: 'Crédito'
    },
    {
        id: 'santander-viajes-001',
        banco: 'Santander',
        descuento: '25%',
        monto: '5000',
        cashback: '',
        categoria: 'Viajes y Turismo',
        validoHasta: '2026-08-31',
        requisitos: 'Tarjeta Select Santander. Compra mínima $2000',
        url: 'https://www.santander.com.ar',
        medioPago: 'Crédito'
    },
    {
        id: 'galicia-combustible-001',
        banco: 'Galicia',
        descuento: '10%',
        monto: '1000',
        cashback: '5%',
        categoria: 'Combustible',
        validoHasta: '2026-06-30',
        requisitos: 'Tarjeta débito Galicia. En estaciones Axion',
        url: 'https://www.bancogalicia.com',
        medioPago: 'Débito'
    },
    {
        id: 'macro-compras-001',
        banco: 'Macro',
        descuento: '12%',
        monto: '2000',
        cashback: '',
        categoria: 'Compras Online',
        validoHasta: '2026-07-20',
        requisitos: 'Tarjeta crédito Macro. En sitios adheridos',
        url: 'https://www.bancomacro.com.ar',
        medioPago: 'Crédito'
    },
    {
        id: 'itau-restaurant-001',
        banco: 'Itaú',
        descuento: '20%',
        monto: '1500',
        cashback: '',
        categoria: 'Gastronomía',
        validoHasta: '2026-09-30',
        requisitos: 'Tarjeta crédito Itaú. En restaurantes seleccionados',
        url: 'https://www.itau.com.ar',
        medioPago: 'Crédito'
    },
    {
        id: 'credicoop-salud-001',
        banco: 'Credicoop',
        descuento: '15%',
        monto: '2500',
        cashback: '',
        categoria: 'Salud y Farmacia',
        validoHasta: '2026-08-15',
        requisitos: 'Tarjeta débito o crédito Credicoop. En farmacias adheridas',
        url: 'https://www.credicoop.com.ar',
        medioPago: 'Débito/Crédito'
    },
    {
        id: 'hipotecario-muebles-001',
        banco: 'Hipotecario Federal',
        descuento: '18%',
        monto: '3500',
        cashback: '',
        categoria: 'Muebles y Decoración',
        validoHasta: '2026-07-31',
        requisitos: 'Tarjeta crédito Hipotecario. Compra mínima $1000',
        url: 'https://www.hipotecario.com.ar',
        medioPago: 'Crédito'
    }
];

async function scrapingBancos() {
    logger.info('   📋 Procesando bancos...');

    // Por ahora retornar descuentos hardcodeados
    // En el futuro aquí iría scraping real de cada web de banco
    return DESCUENTOS_BANCOS;
}

module.exports = {
    scraping: scrapingBancos,
    nombre: 'Bancos Argentinos'
};
