// ============================================================
// VALIDAR DESCUENTOS
// ============================================================

function validarDescuento(descuento) {
    const errores = [];

    // Campos requeridos
    if (!descuento.id) errores.push('Falta ID');
    if (!descuento.banco) errores.push('Falta banco');
    if (!descuento.descuento) errores.push('Falta descuento');
    if (!descuento.categoria) errores.push('Falta categoría');
    if (!descuento.validoHasta) errores.push('Falta fecha de validez');

    // Validar formato de fecha
    if (descuento.validoHasta && !esFormatoFechaValido(descuento.validoHasta)) {
        errores.push('Formato de fecha inválido (debe ser YYYY-MM-DD)');
    }

    // Validar que no esté vencido
    if (descuento.validoHasta && estaVencido(descuento.validoHasta)) {
        errores.push('Descuento ya vencido');
    }

    return {
        valido: errores.length === 0,
        errores
    };
}

function esFormatoFechaValido(fecha) {
    return /^\d{4}-\d{2}-\d{2}$/.test(fecha) && !isNaN(new Date(fecha));
}

function estaVencido(fecha) {
    const hoy = new Date().toISOString().split('T')[0];
    return fecha < hoy;
}

function tieneRequisitosCumplidos(descuento, criterios) {
    // Si no hay requisitos en el descuento, asumir que es válido
    if (!descuento.requisitos) return true;

    // Si el usuario especificó criterios, validar
    if (criterios && criterios.medioPago) {
        return descuento.requisitos.toLowerCase().includes(criterios.medioPago.toLowerCase());
    }

    return true;
}

module.exports = {
    validarDescuento,
    esFormatoFechaValido,
    estaVencido,
    tieneRequisitosCumplidos
};
