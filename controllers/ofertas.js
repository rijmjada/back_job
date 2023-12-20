const { response } = require("express");

const Oferta = require('../models/oferta');
const Usuario = require("../models/usuario");




const listarOfertas = async (req, res) => {
    try {
        const { limite = 50, desde = 0, termino, modalidad, sector, jornada } = req.query;
        let query = { estado: true };

        let ofertas = [];

        if (modalidad) return await listarOfertasPorModalidad(res, modalidad, desde, limite);
        if (sector) return await listarOfertasPorSector(res, sector, desde, limite);
        if (jornada) return await listaOfertasPorTipoDeJornada(res, modalidad, desde, limite);
        if (termino) ofertas = await listarOfertasPorPalabrasClave(termino.toLowerCase(), desde, limite);
        else ofertas = await Oferta.find(query).skip(Number(desde)).limit(Number(limite));

        res.json({
            total: ofertas.length,
            ofertas,
        });
    } catch (error) {
        manejarError(res, 'Error al listar ofertas:');
    }
};

const manejarError = (res, mensaje) => {
    console.error(mensaje);
    res.status(500).json({ error: 'Error interno del servidor' });
};

const listarOfertasPorModalidad = async (res, modalidad, desde, limite) => {
    try {
        const ofertas = await Oferta.find({ modalidad: { $regex: modalidad, $options: 'i' } })
            .skip(Number(desde))
            .limit(Number(limite));
        res.json({
            total: ofertas.length,
            ofertas,
        });
    } catch (error) {
        manejarError(res, 'Error al listar ofertas por modalidad:');
    }
};

const listaOfertasPorTipoDeJornada = async (res, jornada, desde, limite) => {
    try {
        const ofertas = await Oferta.find({ jornada: { $regex: jornada, $options: 'i' } })
            .skip(Number(desde))
            .limit(Number(limite));
        res.json({
            total: ofertas.length,
            ofertas,
        });
    } catch (error) {
        manejarError(res, 'Error al listar ofertas por jornada:');

    }
}

const listarOfertasPorSector = async (res, sector, desde, limite) => {
    try {
        const ofertas = await Oferta.find({ sector: { $regex: sector, $options: 'i' } })
            .skip(Number(desde))
            .limit(Number(limite));
        res.json({
            total: ofertas.length,
            ofertas,
        });
    } catch (error) {
        manejarError(res, 'Error al listar ofertas por sector:');
    }
};

const listarOfertasPorPalabrasClave = async (termino, desde, limite) => {
    try {
        const regexPalabrasClave = termino
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
        }).skip(Number(desde)).limit(Number(limite));


        return ofertas;
    } catch (error) {
        console.error('Error al buscar ofertas por palabras clave:', error);
        throw new Error('Error interno al buscar ofertas');
    }
};






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
            sector,
            empresa,
            jornada,
            usuario: usuario._id // Asegúrate de almacenar solo el ID del usuario, no todo el objeto
        };

        const oferta = new Oferta(objOferta);
        usuario.ofertasPublicadas.push(oferta._id);
        await oferta.save();
        await usuario.save();

        res.json({
            msg: 'POST - crearOferta',
            usuario
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