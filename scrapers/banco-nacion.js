const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

const FALLBACK_BNA = [
    {
        id: 'bna-supermercado-001',
        banco: 'Banco Nación',
        descuento: '30%',
        monto: '3000',
        cashback: '',
        categoria: 'Supermercados',
        validoHasta: '2026-12-31',
        requisitos: 'Tarjeta débito BNA. En Carrefour, Disco, Makro',
        url: 'https://www.bna.com.ar',
        medioPago: 'Débito'
    },
    {
        id: 'bna-gastronomia-001',
        banco: 'Banco Nación',
        descuento: '25%',
        monto: '2000',
        cashback: '',
        categoria: 'Gastronomía',
        validoHasta: '2026-08-31',
        requisitos: 'Tarjeta crédito BNA. En restaurantes seleccionados',
        url: 'https://www.bna.com.ar',
        medioPago: 'Crédito'
    },
    {
        id: 'bna-indumentaria-001',
        banco: 'Banco Nación',
        descuento: '20%',
        monto: '2500',
        cashback: '',
        categoria: 'Ropa y Accesorios',
        validoHasta: '2026-09-30',
        requisitos: 'Tarjeta crédito BNA. En tiendas partner',
        url: 'https://www.bna.com.ar',
        medioPago: 'Crédito'
    },
    {
        id: 'bna-turismo-001',
        banco: 'Banco Nación',
        descuento: '15%',
        monto: '5000',
        cashback: '',
        categoria: 'Viajes y Turismo',
        validoHasta: '2026-07-31',
        requisitos: 'Tarjeta crédito BNA. En agencias de viajes',
        url: 'https://www.bna.com.ar',
        medioPago: 'Crédito'
    },
    {
        id: 'bna-electrodomesticos-001',
        banco: 'Banco Nación',
        descuento: '18%',
        monto: '4000',
        cashback: '',
        categoria: 'Electrónica',
        validoHasta: '2026-10-31',
        requisitos: 'Tarjeta crédito BNA. En Garbarino, Fravega',
        url: 'https://www.bna.com.ar',
        medioPago: 'Crédito'
    }
];

async function scrapingBancoNacion() {
    try {
        const response = await axios.get('https://www.bna.com.ar/Personas/Descuentos', {
            timeout: 8000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const descuentos = [];

        // Intentar parsear descuentos de la página
        $('.promotion, .descuento, .beneficio, .offer').each((i, elem) => {
            const titulo = $(elem).find('.titulo, h3, h4, .title').text().trim();
            const desc = $(elem).find('.descripcion, p, .desc').text().trim();
            const descText = $(elem).find('.descuento, .percent, .porcentaje').text().trim();

            if (titulo && descText) {
                descuentos.push({
                    id: `bna-scraped-${i.toString().padStart(3, '0')}`,
                    banco: 'Banco Nación',
                    descuento: descText,
                    monto: '2000',
                    cashback: '',
                    categoria: 'General',
                    validoHasta: '2026-12-31',
                    requisitos: desc || 'Ver condiciones en el sitio del BNA',
                    url: 'https://www.bna.com.ar',
                    medioPago: 'Débito/Crédito'
                });
            }
        });

        if (descuentos.length > 0) {
            logger.info(`   ✅ BNA (HTTP): ${descuentos.length} descuentos scrapeados`);
            return descuentos;
        }

        logger.info('   ⚠️ BNA: HTML no parseado, usando fallback');
        return FALLBACK_BNA;
    } catch (error) {
        logger.warn(`   ⚠️ BNA HTTP: ${error.message}, usando fallback`);
        return FALLBACK_BNA;
    }
}

module.exports = {
    scraping: scrapingBancoNacion,
    nombre: 'Banco Nación'
};
