const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

const FALLBACK_BANCOCIUDAD = [
    {
        id: 'bancociudad-turismo-001',
        banco: 'Banco Ciudad',
        descuento: '25%',
        monto: '4000',
        cashback: '',
        categoria: 'Viajes y Turismo',
        validoHasta: '2026-09-30',
        requisitos: 'Tarjeta crédito Banco Ciudad. En agencias de viajes',
        url: 'https://www.bancociudad.com.ar',
        medioPago: 'Crédito'
    },
    {
        id: 'bancociudad-salud-001',
        banco: 'Banco Ciudad',
        descuento: '20%',
        monto: '2000',
        cashback: '',
        categoria: 'Salud y Farmacia',
        validoHasta: '2026-08-31',
        requisitos: 'Tarjeta débito Banco Ciudad. En farmacias adheridas',
        url: 'https://www.bancociudad.com.ar',
        medioPago: 'Débito'
    },
    {
        id: 'bancociudad-supermercado-001',
        banco: 'Banco Ciudad',
        descuento: '15%',
        monto: '2500',
        cashback: '',
        categoria: 'Supermercados',
        validoHasta: '2026-10-31',
        requisitos: 'Tarjeta crédito Banco Ciudad. En Carrefour e Hipermercados',
        url: 'https://www.bancociudad.com.ar',
        medioPago: 'Crédito'
    },
    {
        id: 'bancociudad-entretenimiento-001',
        banco: 'Banco Ciudad',
        descuento: '18%',
        monto: '1500',
        cashback: '',
        categoria: 'Entretenimiento',
        validoHasta: '2026-07-31',
        requisitos: 'Tarjeta crédito Banco Ciudad. En cines y teatros',
        url: 'https://www.bancociudad.com.ar',
        medioPago: 'Crédito'
    }
];

async function scrapingBancoCiudad() {
    try {
        const response = await axios.get('https://www.bancociudad.com.ar/beneficios', {
            timeout: 8000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const descuentos = [];

        // Intentar parsear descuentos
        $('.beneficio, .promocion, .descuento, .offer').each((i, elem) => {
            const titulo = $(elem).find('.titulo, .nombre, h3, h4').text().trim();
            const desc = $(elem).find('.descripcion, .desc, p').text().trim();
            const descText = $(elem).find('.porcentaje, .discount, .off').text().trim();

            if (titulo && descText) {
                descuentos.push({
                    id: `bancociudad-scraped-${i.toString().padStart(3, '0')}`,
                    banco: 'Banco Ciudad',
                    descuento: descText,
                    monto: '2500',
                    cashback: '',
                    categoria: 'General',
                    validoHasta: '2026-12-31',
                    requisitos: desc || 'Ver condiciones en el sitio',
                    url: 'https://www.bancociudad.com.ar',
                    medioPago: 'Débito/Crédito'
                });
            }
        });

        if (descuentos.length > 0) {
            logger.info(`   ✅ Banco Ciudad (HTTP): ${descuentos.length} descuentos scrapeados`);
            return descuentos;
        }

        logger.info('   ⚠️ Banco Ciudad: HTML no parseado, usando fallback');
        return FALLBACK_BANCOCIUDAD;
    } catch (error) {
        logger.warn(`   ⚠️ Banco Ciudad HTTP: ${error.message}, usando fallback`);
        return FALLBACK_BANCOCIUDAD;
    }
}

module.exports = {
    scraping: scrapingBancoCiudad,
    nombre: 'Banco Ciudad'
};
