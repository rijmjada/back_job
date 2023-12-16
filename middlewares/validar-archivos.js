const { response } = require("express");
const path = require('path');

const validarArchivoSubir = (extensionesPermitidas) => (req, res = response, next) => {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.archivo) {
        return res.status(400).json({
            msg: 'No hay archivos que subir - validarArchivoSubir'
        });
    }

    const archivo = req.files.archivo;

    // Obtener la extensión del archivo directamente del nombre
    const extension = path.extname(archivo.name).toLowerCase();

    // Verificar si la extensión está permitida
    if (!extensionesPermitidas.includes(extension.slice(1))) {
        return res.status(400).json({
            msg: `La extensión del archivo no está permitida, suba un archivo: ${extensionesPermitidas}`
        });
    }

    next();
};

module.exports = {
    validarArchivoSubir
};
