const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

const FALLBACK_FARMACITY = [
    {
        id: 'farmacity-genericos-001',
        banco: 'Farmacity',
        descuento: '40%',
        monto: '2000',
        cashback: '',
        categoria: 'Farmacia - Genéricos',
        validoHasta: '2026-12-31',
        requisitos: 'En medicamentos genéricos seleccionados',
        url: 'https://www.farmacity.com',
        medioPago: 'Cualquiera'
    },
    {
        id: 'farmacity-dermocosmetica-001',
        banco: 'Farmacity',
        descuento: '3x2',
        monto: '1500',
        cashback: '',
        categoria: 'Farmacia - Cosméticos',
        validoHasta: '2026-08-31',
        requisitos: '3 productos x 2 en dermocosméticos',
        url: 'https://www.farmacity.com',
        medioPago: 'Cualquiera'
    },
    {
        id: 'farmacity-naranja-001',
        banco: 'Farmacity',
        descuento: '25%',
        monto: '1200',
        cashback: '',
        categoria: 'Farmacia',
        validoHasta: '2026-09-30',
        requisitos: 'Con tarjeta Naranja. Máximo $1200 descuento',
        url: 'https://www.farmacity.com',
        medioPago: 'Tarjeta Naranja'
    },
    {
        id: 'farmacity-vitaminas-001',
        banco: 'Farmacity',
        descuento: '20%',
        monto: '1000',
        cashback: '',
        categoria: 'Farmacia - Vitaminas',
        validoHasta: '2026-10-31',
        requisitos: 'En vitaminas y suplementos',
        url: 'https://www.farmacity.com',
        medioPago: 'Cualquiera'
    }
];

async function scrapingFarmacity() {
    try {
        const response = await axios.get('https://www.farmacity.com/descuentos', {
            timeout: 8000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const descuentos = [];

        // Intentar parsear descuentos
        $('.producto, .item, .promotion, [data-product]').each((i, elem) => {
            const titulo = $(elem).find('.titulo, .nombre, h3, h4').text().trim();
            const desc = $(elem).find('.descripcion, .desc, p').text().trim();
            const descText = $(elem).find('.descuento, .off, .percent').text().trim();

            if (titulo && descText) {
                descuentos.push({
                    id: `farmacity-scraped-${i.toString().padStart(3, '0')}`,
                    banco: 'Farmacity',
                    descuento: descText,
                    monto: '1500',
                    cashback: '',
                    categoria: 'Farmacia',
                    validoHasta: '2026-12-31',
                    requisitos: desc || 'Ver detalles en el sitio',
                    url: 'https://www.farmacity.com',
                    medioPago: 'Cualquiera'
                });
            }
        });

        if (descuentos.length > 0) {
            logger.info(`   ✅ Farmacity (HTTP): ${descuentos.length} descuentos scrapeados`);
            return descuentos;
        }

        logger.info('   ⚠️ Farmacity: HTML no parseado, usando fallback');
        return FALLBACK_FARMACITY;
    } catch (error) {
        logger.warn(`   ⚠️ Farmacity HTTP: ${error.message}, usando fallback`);
        return FALLBACK_FARMACITY;
    }
}

module.exports = {
    scraping: scrapingFarmacity,
    nombre: 'Farmacity'
};
