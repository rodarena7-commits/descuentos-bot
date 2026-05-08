const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

// Lista de bancos a scrapear
const BANCOS = [
    { nombre: 'BBVA', url: 'https://www.bbvaargentina.com/banca-personas/promociones/' },
    { nombre: 'Santander', url: 'https://www.santander.com.ar/personas/promociones' },
    { nombre: 'Galicia', url: 'https://www.bancogalicia.com/personas/promociones' },
    { nombre: 'Macro', url: 'https://www.bancomacro.com.ar/personas/promociones' },
    { nombre: 'Itaú', url: 'https://www.itau.com.ar/personas/promociones' },
    { nombre: 'Credicoop', url: 'https://www.credicoop.com.ar/personas/promociones' },
];

async function scrapingBancos() {
    const descuentos = [];

    logger.info('   📋 Procesando bancos...');

    for (const banco of BANCOS) {
        try {
            logger.info(`      ⏳ ${banco.nombre}...`);
            const resultado = await scrapearBanco(banco);
            descuentos.push(...resultado);
        } catch (error) {
            logger.warn(`      ⚠️ Error en ${banco.nombre}: ${error.message}`);
        }
    }

    return descuentos;
}

async function scrapearBanco(banco) {
    try {
        const { data } = await axios.get(banco.url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(data);
        const descuentos = [];

        // Estructura genérica para extraer descuentos
        // NOTA: Cada banco tendrá selectors diferentes, estos son ejemplos
        $('.promocion, .descuento, .oferta').each((i, elem) => {
            const descuento = extraerDescuentoDelElement($, elem, banco);
            if (descuento) {
                descuentos.push(descuento);
            }
        });

        return descuentos;
    } catch (error) {
        throw new Error(`Error scrapeando ${banco.nombre}: ${error.message}`);
    }
}

function extraerDescuentoDelElement($, elem, banco) {
    // Esta función requiere ajustes específicos para cada banco
    const titulo = $(elem).find('.titulo, h3, h4').text().trim();
    const descripcion = $(elem).find('.descripcion, p').text().trim();
    const descuentoText = $(elem).find('.descuento, .porcentaje').text().trim();

    if (!titulo || !descuentoText) return null;

    return {
        id: `${banco.nombre.toLowerCase()}-${Date.now()}`,
        banco: banco.nombre,
        descuento: descuentoText,
        monto: extraerMonto(descripcion),
        cashback: extraerCashback(descripcion),
        categoria: 'General',
        validoHasta: calcularVencimiento(),
        requisitos: descripcion,
        url: banco.url,
        fechaActualizacion: new Date().toISOString().split('T')[0]
    };
}

function extraerMonto(texto) {
    // Buscar patrones como "$5000" o "5000"
    const match = texto.match(/\$?([\d.]+)/);
    return match ? match[1] : '';
}

function extraerCashback(texto) {
    if (texto.toLowerCase().includes('cashback')) {
        const match = texto.match(/(\d+)%/);
        return match ? `${match[1]}%` : '';
    }
    return '';
}

function calcularVencimiento() {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 30); // 30 días por defecto
    return fecha.toISOString().split('T')[0];
}

module.exports = {
    scraping: scrapingBancos,
    nombre: 'Bancos Argentinos'
};
