const logger = require('../utils/logger');

// Importar todos los scrapers
const bancos = require('./bancos');
const mercadoPago = require('./mercadopago');
const mercadoLibre = require('./mercadolibre');
const lemon = require('./lemon');
const cuentaDNI = require('./cuenta-dni');
const rippio = require('./rippio');
const astropay = require('./astropay');
const personalPay = require('./personalpay');

// ============================================================
// EJECUTAR TODOS LOS SCRAPERS
// ============================================================
async function ejecutarTodosScraping() {
    logger.info('🔍 Iniciando scraping de todos los descuentos...');

    const resultados = {
        descuentos: [],
        errores: [],
        fecha: new Date().toISOString()
    };

    const scrapers = [
        { nombre: 'Bancos', fn: bancos.scraping },
        { nombre: 'Mercado Pago', fn: mercadoPago.scraping },
        { nombre: 'Mercado Libre', fn: mercadoLibre.scraping },
        { nombre: 'Lemon', fn: lemon.scraping },
        { nombre: 'Cuenta DNI', fn: cuentaDNI.scraping },
        { nombre: 'Rippio', fn: rippio.scraping },
        { nombre: 'Astropay', fn: astropay.scraping },
        { nombre: 'Personal Pay', fn: personalPay.scraping }
    ];

    for (const scraper of scrapers) {
        try {
            logger.info(`   ⏳ Scraping ${scraper.nombre}...`);
            const descuentos = await scraper.fn();
            resultados.descuentos.push(...descuentos);
            logger.info(`   ✅ ${scraper.nombre}: ${descuentos.length} descuentos`);
        } catch (error) {
            logger.error(`   ❌ Error en ${scraper.nombre}: ${error.message}`);
            resultados.errores.push({
                scraper: scraper.nombre,
                error: error.message
            });
        }
    }

    logger.info(`\n📊 Scraping completado`);
    logger.info(`   Total de descuentos: ${resultados.descuentos.length}`);
    logger.info(`   Errores: ${resultados.errores.length}`);

    return resultados;
}

// ============================================================
// FILTRAR DESCUENTOS NO VENCIDOS
// ============================================================
function filtrarDescuentosActivos(descuentos) {
    const hoy = new Date().toISOString().split('T')[0];
    return descuentos.filter(d => {
        const vencimiento = d.validoHasta || '2099-12-31';
        return vencimiento >= hoy;
    });
}

// ============================================================
// BUSCAR DESCUENTOS POR CRITERIOS
// ============================================================
function buscarDescuentos(descuentos, criterios) {
    let resultado = [...descuentos];

    // Filtrar por categoría
    if (criterios.categoria) {
        resultado = resultado.filter(d =>
            d.categoria && d.categoria.toLowerCase().includes(criterios.categoria.toLowerCase())
        );
    }

    // Filtrar por banco
    if (criterios.banco) {
        resultado = resultado.filter(d =>
            d.banco && d.banco.toLowerCase().includes(criterios.banco.toLowerCase())
        );
    }

    // Filtrar por medio de pago
    if (criterios.medioPago) {
        resultado = resultado.filter(d =>
            d.requisitos && d.requisitos.toLowerCase().includes(criterios.medioPago.toLowerCase())
        );
    }

    // Filtrar por monto mínimo de reintegro
    if (criterios.montoMinimo) {
        resultado = resultado.filter(d => {
            const monto = parseInt(d.monto) || 0;
            return monto >= criterios.montoMinimo;
        });
    }

    return resultado;
}

module.exports = {
    ejecutarTodosScraping,
    filtrarDescuentosActivos,
    buscarDescuentos
};
