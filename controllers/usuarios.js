const { response, request } = require('express');
const bcryptjs = require('bcryptjs');


const Usuario = require('../models/usuario');
const Postulante = require('../models/postulante');
const Empresa = require('../models/empresa');

const Oferta = require('../models/oferta');


// Listar
const ListarUsuarios = async (req = request, res = response) => {

    const { limite = 5, desde = 0 } = req.query;
    const query = { estado: true };

    const [total, usuarios] = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    res.json({
        total,
        usuarios
    });
}

const CrearUsuarioPostulante = async (req, res = response) => {

    const { nombre, apellido, correo, password, rol, img } = req.body;
    const usuario = new Postulante({ nombre, apellido, correo, password, rol, img });

    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync(password, salt);

    // Guardar en BD
    await usuario.save();

    res.json({
        usuario
    });
}

const CrearUsuarioEmpresa = async (req, res = response) => {

    try {
        const {
            nombre,
            apellido,
            correo,
            password,
            rol,
            img,
            nombreEmpresa,
            razonSocial,
            telefono,
            direccion,
            sector,
            numero_trabajadores
        } = req.body;

        let usuario = await new Empresa({
            nombre, apellido, correo, password, rol, img, nombreEmpresa, razonSocial, telefono, direccion, sector,
            numero_trabajadores
        });

        // Encriptar la contraseña
        const salt = bcryptjs.genSaltSync();
        usuario.password = bcryptjs.hashSync(password, salt);

        // Guardar en BD
        await usuario.save();

        res.json({
            usuario
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}


const actualizarEstadoOferta = async (ofertaId, usuarioId) => {
    try {
        const oferta = await Oferta.findById(ofertaId);

        if (oferta) {
            // Agregar el ID del usuario a la lista de postulantes de la oferta
            oferta.postulantes.push(usuarioId);
            // Actualizar el estado de la oferta si es necesario
            await oferta.save();
        }
    } catch (error) {
        console.error("Error al actualizar estado de la oferta:", error.message);
        throw new Error("Error interno al actualizar estado de la oferta");
    }
};

// Actualizar Usuario
const encriptarPassword = (password) => {
    const salt = bcryptjs.genSaltSync();
    return bcryptjs.hashSync(password, salt);
};

const aplicarOferta = async (id, ofertaId, rtaMessage) => {

    const usuario = await Usuario.findById(id);
    const oferta = await Oferta.findById(ofertaId);

    if (oferta.estado) {
        if (usuario.ofertasAplicadas.includes(ofertaId)) {
            rtaMessage = "El usuario ya aplico a esta oferta. ";
        } else {
            try {
                // Actualizar el estado de la oferta y agregar el ID del usuario a la lista de postulantes
                await actualizarEstadoOferta(ofertaId, id);
                usuario.ofertasAplicadas.push(ofertaId);
                await usuario.save();
                rtaMessage += "Aplicación a la oferta exitosa. ";
            } catch (error) {
                console.log(`\n ${error} \n`);
                rtaMessage = error.message;
            }
        }
    }

    return rtaMessage;
};



const actualizarDatosUsuario = async (id, resto) => {
    const usuario = await Usuario.findById(id);
    if (usuario.rol === 'postulante') {
        return await Postulante.findByIdAndUpdate(id, resto, { new: true });
    }
    else if (usuario.rol === 'empresa') {
        return await Empresa.findByIdAndUpdate(id, resto, { new: true });
    }
};

// Actualizar Usuario
const ActualizarUsuario = async (req, res = response) => {

    let message = 'Usuario actualizado. ';
    try {
        const { id } = req.params;
        const { password, ofertaId, ...resto } = req.body;

        if (password) {
            resto.password = encriptarPassword(password);
        }
        if (ofertaId) {
            message = await aplicarOferta(id, ofertaId, message);
        }

        const usuario = await actualizarDatosUsuario(id, resto);
        res.json({
            message,
            usuario,
        });
    } catch (error) {
        console.error("Error al actualizar usuario:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};


const chequearPassword = async (req, res = response) => {

    try {
        const { password } = req.body;
        const { id } = req.params;

        const user = await Usuario.findById(id);

        if (user) {
            const contraseñaValida = bcryptjs.compareSync(password, user.password);
            if (!contraseñaValida) {
                return res.status(400).json({ message: 'La contraseña proporcionada no es válida' });
            }
        } else {
            return res.status(400).json({ message: `No hay un usuario con el id ${id_user}` });
        }
    } catch (error) {
        console.log(`Error: ${error}`)
        return res.status(500).json({ message: `${error}` });
    }

    res.json({ message: 'La contraseña es correcta' });
};

const BuscarUsuario = async (req, res = response) => {

    try {
        const { id } = req.params;

        const usuario = await Usuario.findOne({ _id: id })

        res.json({
            usuario
        });
    } catch (error) {
        console.error("Error al buscar al usuario:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};




// TODO:
const usuariosPatch = (req, res = response) => {
    res.json({
        msg: 'patch API - usuariosPatch'
    });
}

// "Eliminar"
const EliminarUsuario = async (req, res = response) => {
    try {
        const { id } = req.params;
        // Agrega la opción { new: true } para obtener el usuario actualizado
        const usuario = await Usuario.findByIdAndUpdate(id, { estado: false }, { new: true });

        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json({
            message: 'Usuario eliminiado',
            usuario
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
}




module.exports = {
    ListarUsuarios,
    ActualizarUsuario,
    usuariosPatch,
    EliminarUsuario,
    BuscarUsuario,
    chequearPassword,
    CrearUsuarioPostulante,
    CrearUsuarioEmpresa
}