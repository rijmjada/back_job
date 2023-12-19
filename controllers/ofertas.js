const { response } = require("express");

const Oferta = require('../models/oferta');
const Usuario = require("../models/usuario");


// LISTAR OFERTAS
// const listarOfertas = async (req, res = response) => {
//     try {
//         const { limite = 10, desde = 0, modalidad } = req.query;
//         let query = { estado: true };

//         // Agregar el filtro por modalidad si se proporciona en los parámetros de consulta
//         if (modalidad) {
//             query.modalidad = modalidad;
//         }

//         const [total, ofertas] = await Promise.all([
//             Oferta.countDocuments(query),
//             Oferta.find(query)
//                 .skip(Number(desde))
//                 .limit(Number(limite))
//         ]);

//         res.json({
//             total,
//             ofertas
//         });
//     } catch (error) {
//         console.error('Error al listar ofertas:', error);
//         res.status(500).json({ error: 'Error interno del servidor' });
//     }
// };

const buscarOfertasPorPalabrasClave = async (palabrasClave) => {
    try {
        const regexPalabrasClave = palabrasClave
            .toLowerCase()
            .split(' ')
            .map(keyword => new RegExp(keyword, 'i'));

        const ofertas = await Oferta.find({
            $or: [
                { titulo: { $in: regexPalabrasClave } },
                { descripcion: { $in: regexPalabrasClave } },
                { ubicacion: { $in: regexPalabrasClave } },
                { empresa: { $in: regexPalabrasClave } },
                { modalidad: { $in: regexPalabrasClave } },

            ],
            estado: true,
        });

        return ofertas;
    } catch (error) {
        console.error('Error al buscar ofertas por palabras clave:', error);
        throw new Error('Error interno al buscar ofertas');
    }
};

const listarOfertas = async (req, res = response) => {
    try {
        const { limite = 100, desde = 0, termino, modalidad, sector } = req.query;
        let query = { estado: true };

        let ofertas = [];

        if (modalidad) {
            query.modalidad = modalidad;
        }

        if (sector) {
            ofertas = await Oferta.find({ sector: { $regex: sector, $options: 'i' } });
            return res.json({
                total: ofertas.length,
                ofertas,
            });
        }
        

        if (termino) {
            // Realizar búsqueda por palabras clave
            ofertas = await buscarOfertasPorPalabrasClave(termino.toLowerCase());
        } else {
            // Obtener todas las ofertas si no se proporcionan palabras clave
            ofertas = await Oferta.find(query)
                .skip(Number(desde))
                .limit(Number(limite));
        }

        res.json({
            total: ofertas.length,
            ofertas,
        });
    } catch (error) {
        console.error('Error al listar ofertas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Ejemplo de uso de la función listarOfertas con palabras clave:
// /api/ofertas?palabrasClave=remoto Nike New York
// /api/ofertas?modalidad=remoto
// /api/ofertas  (sin parámetros)

// Ejemplo de uso de la función listarOfertas con palabras clave:
// /api/ofertas?palabrasClave=remoto Nike New York
// /api/ofertas?modalidad=remoto
// /api/ofertas  (sin parámetros)



// CREAR UNA OFERTA NUEVA
const crearOferta = async (req, res = response) => {
    try {
        const { titulo, ubicacion, descripcion, salario, empresa, modalidad, sector, jornada } = req.body;
        const { id } = req.params;

        // Primero, obtén el usuario
        const usuario = await Usuario.findById(id);

        // Luego, crea el objeto de oferta usando el usuario obtenido
        const objOferta = {
            titulo,
            ubicacion,
            descripcion,
            salario,
            modalidad,
            empresa,
            sector,
            jornada,
            usuario: usuario._id // Asegúrate de almacenar solo el ID del usuario, no todo el objeto
        };

        // const oferta = new Oferta(objOferta);
        // usuario.ofertasPublicadas.push(oferta._id);
        // await oferta.save();
        // await usuario.save();

        res.json({
            msg: 'POST - crearOferta',
            objOferta
        });
    } catch (error) {
        res.status(401).json(error);
    }
};


// BUSCAR UNA OFERTA POR ID
const buscarOfertaPorID = async (req, res) => {
    try {
        const { id } = req.params;

        const oferta = await Oferta.findById(id);

        res.json(oferta);

    } catch (error) {
        console.error('Error al buscar ofertas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


const ListarSectores = async (req, res) => {
    try {
        const ofertas = await Oferta.find({ estado: true });
        const sectores = {};

        ofertas.forEach(oferta => {
            if (oferta.sector in sectores) {
                sectores[oferta.sector]++;
            } else {
                sectores[oferta.sector] = 1;
            }
        });

        res.json(sectores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los sectores' });
    }
};


const ListarFechas = async (req, res) => {
    try {
        const fechas = await Oferta.distinct("fechaCreacion", { estado: true });

        res.json(fechas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las fechas de las ofertas' });
    }
};

const ListarModalidades = async (req, res) => {
    try {
        const ofertas = await Oferta.find({ estado: true });
        const modalidades = {
            presencial: 0,
            remoto: 0,
            hibrido: 0,
        };

        ofertas.forEach((oferta) => {
            modalidades[oferta.modalidad]++;
        });

        res.json(modalidades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las modalidades' });
    }
}

//TODO: ACTUALIZAR OFERTA
const actualizarOferta = (req, res = response) => {
    res.json({
        msg: 'PUT - Actulizar oferta'
    });
}

// ELIMINAR OFERTA
const eliminarOferta = async (req, res = response) => {
    try {
        const { id } = req.params;
        // Agrega la opción { new: true } para obtener el usuario actualizado
        const oferta = await Oferta.findByIdAndUpdate(id, { estado: false }, { new: true });

        if (!oferta) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json({
            message: 'Oferta eliminiada',
            oferta
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
}




module.exports = {
    crearOferta,
    listarOfertas,
    actualizarOferta,
    eliminarOferta,
    buscarOfertaPorID,
    ListarSectores,
    ListarFechas,
    ListarModalidades
}