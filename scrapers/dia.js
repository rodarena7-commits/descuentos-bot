const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

const FALLBACK_DIA = [
    {
        id: 'dia-miercoles-001',
        banco: 'Día%',
        descuento: '30%',
        monto: '3000',
        cashback: '',
        categoria: 'Supermercados - Verduras',
        validoHasta: '2026-12-31',
        requisitos: 'Miércoles de ofertas en frutas y verduras',
        url: 'https://www.diaargentina.com',
        medioPago: 'Cualquiera'
    },
    {
        id: 'dia-jueves-001',
        banco: 'Día%',
        descuento: '25%',
        monto: '3500',
        cashback: '',
        categoria: 'Supermercados - Carnes',
        validoHasta: '2026-12-31',
        requisitos: 'Jueves de descuentos en carnes y pollos',
        url: 'https://www.diaargentina.com',
        medioPago: 'Cualquiera'
    },
    {
        id: 'dia-viernes-001',
        banco: 'Día%',
        descuento: '20%',
        monto: '2500',
        cashback: '',
        categoria: 'Supermercados - Lácteos',
        validoHasta: '2026-12-31',
        requisitos: 'Viernes de promociones en lácteos y quesos',
        url: 'https://www.diaargentina.com',
        medioPago: 'Cualquiera'
    },
    {
        id: 'dia-fin-semana-001',
        banco: 'Día%',
        descuento: '15%',
        monto: '2000',
        cashback: '',
        categoria: 'Supermercados - Limpieza',
        validoHasta: '2026-12-31',
        requisitos: 'Fin de semana descuentos en artículos de limpieza',
        url: 'https://www.diaargentina.com',
        medioPago: 'Cualquiera'
    }
];

async function scrapingDia() {
    try {
        const response = await axios.get('https://www.diaargentina.com/ofertas', {
            timeout: 8000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const descuentos = [];

        // Intentar parsear descuentos de oferta
        $('.producto, .item-oferta, .promotion, [data-promotion]').each((i, elem) => {
            const nombre = $(elem).find('.nombre, .titulo, h3, h4').text().trim();
            const precio = $(elem).find('.precio, .price, [class*="price"]').text().trim();
            const descText = $(elem).find('.descuento, .off, .percent, [class*="discount"]').text().trim();

            if (nombre && descText) {
                descuentos.push({
                    id: `dia-scraped-${i.toString().padStart(3, '0')}`,
                    banco: 'Día%',
                    descuento: descText,
                    monto: '2000',
                    cashback: '',
                    categoria: 'Supermercados',
                    validoHasta: '2026-12-31',
                    requisitos: `${nombre} - ${precio}`,
                    url: 'https://www.diaargentina.com',
                    medioPago: 'Cualquiera'
                });
            }
        });

        if (descuentos.length > 0) {
            logger.info(`   ✅ Día% (HTTP): ${descuentos.length} descuentos scrapeados`);
            return descuentos;
        }

        logger.info('   ⚠️ Día%: HTML no parseado, usando fallback');
        return FALLBACK_DIA;
    } catch (error) {
        logger.warn(`   ⚠️ Día% HTTP: ${error.message}, usando fallback`);
        return FALLBACK_DIA;
    }
}

module.exports = {
    scraping: scrapingDia,
    nombre: 'Día%'
};
