
const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL);

const { response } = require('express');

const { Usuario } = require('../models');



const actualizarImagenCloudinary = async (req, res = response) => {

    const { id, coleccion } = req.params;

    let modelo = await Usuario.findById(id);
    
    if (!modelo) {
        return res.status(400).json({
            msg: `No existe un usuario con el id ${id}`
        });
    }

    // Limpiar imágenes previas
    if (modelo.img) {
        const nombreArr = modelo.img.split('/');
        const nombre = nombreArr[nombreArr.length - 1];
        const [public_id] = nombre.split('.');
        cloudinary.uploader.destroy(public_id);
    }

    const { tempFilePath } = req.files.archivo
    const { secure_url } = await cloudinary.uploader.upload(tempFilePath);
    modelo.img = secure_url;

    await modelo.save();

    res.json(modelo);
}


const agregarCurriculum = async (req, res = response) => {

    try {
        const { id } = req.params;

        let modelo = await Usuario.findById(id);
        if (!modelo) {
            return res.status(400).json({
                msg: `No existe un usuario con el id ${id}`
            });
        };

        const archivo = req.files.archivo;
        const { tempFilePath, name } = archivo;

        // Eliminar la extensión duplicada, si existe
        const nombreArchivo = name.replace(/\.(\w+)$/g, '');
        console.log(nombreArchivo)
        const { secure_url } = await cloudinary.uploader.upload(tempFilePath, {
            public_id: nombreArchivo, // Utiliza el nombre corregido como el public_id en Cloudinary
        });

        modelo.curriculum.push(secure_url);
        // Guarda el modelo actualizado
        await modelo.save();
        res.json(modelo);

    } catch (error) {
        return res.status(500).json({
            msg: error
        });
    }
};

const eliminarCurriculum = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { url } = req.body;

        let modelo = await Usuario.findById(id);
        if (!modelo) {
            return res.status(400).json({
                msg: `No existe un usuario con el id ${id}`
            });
        }

        // Extraer el public_id de la URL almacenada
        const publicId = obtenerPublicIdDesdeUrl(url);

        // Eliminar el recurso de Cloudinary
        console.log(publicId)
        console.log(await cloudinary.uploader.destroy(publicId));

        // Filtrar y actualizar el modelo para quitar la URL eliminada
        modelo.curriculum = modelo.curriculum.filter(curriculumUrl => curriculumUrl !== url);

        // Guardar el modelo actualizado
        await modelo.save();

        res.json({
            msg: 'PDF eliminado'
        });

    } catch (error) {
        return res.status(500).json({
            msg: error
        });
    }
};

// Función auxiliar para obtener el public_id desde una URL de Cloudinary
const obtenerPublicIdDesdeUrl = (url) => {
    const matches = url.match(/\/v\d+\/(.+?)\.\w+$/);
    return matches ? matches[1] : null;
};





module.exports = {
    actualizarImagenCloudinary,
    agregarCurriculum,
    eliminarCurriculum
}