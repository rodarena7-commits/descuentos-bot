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

// Nuevos scrapers
const dia = require('./dia');
const farmacity = require('./farmacity');
const rappi = require('./rappi');
const pedidosYa = require('./pedidosya');
const naranjaX = require('./naranjax');
const uala = require('./uala');
const bancoNacion = require('./banco-nacion');
const hsbc = require('./hsbc');
const icbc = require('./icbc');
const bancoCiudad = require('./banco-ciudad');

// ============================================================
// EJECUTAR TODOS LOS SCRAPERS (EN PARALELO)
// ============================================================
async function ejecutarTodosScraping() {
    logger.info('🔍 Iniciando scraping paralelo de todos los descuentos...');

    const resultados = {
        descuentos: [],
        errores: [],
        fecha: new Date().toISOString()
    };

    const scrapers = [
        // Originales
        { nombre: 'Bancos', fn: bancos.scraping },
        { nombre: 'Mercado Pago', fn: mercadoPago.scraping },
        { nombre: 'Mercado Libre', fn: mercadoLibre.scraping },
        { nombre: 'Lemon', fn: lemon.scraping },
        { nombre: 'Cuenta DNI', fn: cuentaDNI.scraping },
        { nombre: 'Rippio', fn: rippio.scraping },
        { nombre: 'Astropay', fn: astropay.scraping },
        { nombre: 'Personal Pay', fn: personalPay.scraping },
        // Nuevos - Con HTTP real + fallback
        { nombre: 'Día%', fn: dia.scraping },
        { nombre: 'Farmacity', fn: farmacity.scraping },
        { nombre: 'Banco Nación', fn: bancoNacion.scraping },
        { nombre: 'Banco Ciudad', fn: bancoCiudad.scraping },
        // Nuevos - Solo hardcodeados
        { nombre: 'Rappi', fn: rappi.scraping },
        { nombre: 'PedidosYa', fn: pedidosYa.scraping },
        { nombre: 'NaranjaX', fn: naranjaX.scraping },
        { nombre: 'Ualá', fn: uala.scraping },
        { nombre: 'HSBC', fn: hsbc.scraping },
        { nombre: 'ICBC', fn: icbc.scraping }
    ];

    // Lanzar todos los scrapers en paralelo
    const promesas = scrapers.map(s =>
        s.fn()
            .then(descuentos => ({ nombre: s.nombre, descuentos, ok: true }))
            .catch(error => ({ nombre: s.nombre, error: error.message, ok: false }))
    );

    const resultadosBrutos = await Promise.allSettled(promesas);

    // Procesar resultados
    resultadosBrutos.forEach(r => {
        if (r.status === 'fulfilled') {
            const { nombre, descuentos, ok, error } = r.value;
            if (ok) {
                resultados.descuentos.push(...descuentos);
                logger.info(`   ✅ ${nombre}: ${descuentos.length} descuentos`);
            } else {
                logger.error(`   ❌ ${nombre}: ${error}`);
                resultados.errores.push({ scraper: nombre, error });
            }
        } else {
            logger.error(`   ❌ Error desconocido: ${r.reason}`);
            resultados.errores.push({ scraper: 'desconocido', error: String(r.reason) });
        }
    });

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
            d.medioPago && d.medioPago.toLowerCase().includes(criterios.medioPago.toLowerCase())
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
