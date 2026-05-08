// ============================================================
// FORMATEAR DESCUENTOS PARA MOSTRAR AL USUARIO
// ============================================================

function formatearDescuento(descuento) {
    const lineas = [
        `🏷️ ${descuento.banco}`,
        `📌 ${descuento.categoria}`,
        `💰 Descuento: ${descuento.descuento}`,
    ];

    if (descuento.monto) {
        lineas.push(`💵 Monto: $${descuento.monto}`);
    }

    if (descuento.cashback) {
        lineas.push(`♻️ Cashback: ${descuento.cashback}`);
    }

    if (descuento.validoHasta) {
        lineas.push(`⏰ Válido hasta: ${descuento.validoHasta}`);
    }

    if (descuento.requisitos) {
        lineas.push(`✅ Requisitos: ${descuento.requisitos}`);
    }

    return lineas.join('\n');
}

function formatearListaDescuentos(descuentos) {
    if (descuentos.length === 0) {
        return '❌ No hay descuentos disponibles';
    }

    const grupos = {};

    // Agrupar por banco
    descuentos.forEach(d => {
        if (!grupos[d.banco]) {
            grupos[d.banco] = [];
        }
        grupos[d.banco].push(d);
    });

    let texto = `🎁 *${descuentos.length} DESCUENTOS DISPONIBLES*\n\n`;

    Object.entries(grupos).forEach(([banco, descuentosBanco]) => {
        texto += `*${banco}* (${descuentosBanco.length})\n`;
        descuentosBanco.forEach(d => {
            texto += `  • ${d.descuento} en ${d.categoria}\n`;
            if (d.monto) {
                texto += `    Monto: $${d.monto}\n`;
            }
            if (d.validoHasta) {
                texto += `    Hasta: ${d.validoHasta}\n`;
            }
        });
        texto += '\n';
    });

    return texto;
}

function formatearResumenScraping(resultado) {
    let texto = `
📊 *RESUMEN SCRAPING*
🕐 Hora: ${new Date(resultado.fecha).toLocaleString('es-AR')}

✅ *Resultados*:
   • Descuentos encontrados: ${resultado.descuentos.length}
   • Errores: ${resultado.errores.length}

`;

    if (resultado.errores.length > 0) {
        texto += `⚠️ *Errores detectados*:\n`;
        resultado.errores.forEach(e => {
            texto += `   • ${e.scraper}: ${e.error}\n`;
        });
    }

    return texto;
}

module.exports = {
    formatearDescuento,
    formatearListaDescuentos,
    formatearResumenScraping
};
