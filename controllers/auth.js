const { response } = require('express');
const bcryptjs = require('bcryptjs')

const Usuario = require('../models/usuario');

const { generarJWT } = require('../helpers/generar-jwt');
const { googleVerify } = require('../helpers/google-verify')


const login = async (req, res = response) => {

    const { correo, password } = req.body;

    try {
        // Verificar si el email existe
        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(400).json({
                msg: 'Usuario y/o password no son correctos'
            });
        }

        // SI el usuario está activo
        if (!usuario.estado) {
            return res.status(400).json({
                msg: 'Usuario bloqueado por el administrador'
            });
        }

        // Verificar la contraseña
        const validPassword = bcryptjs.compareSync(password, usuario.password);
        if (!validPassword) {
            return res.status(400).json({
                msg: 'Usuario y/o password no son correctos'
            });
        }

        // Generar el JWT
        const token = await generarJWT(usuario.id);

        res.json({
            usuario,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }

}

const googleSignIn = async (req, res = response) => {

    const { id_token } = req.body;
    try {
        const { correo, img, nombre, apellido } = await googleVerify(id_token);

        let usuario = await Usuario.findOne({ correo });

        if (!usuario) {
            const data = {
                nombre,
                apellido,
                correo,
                img,
                password: ':P',
                google: true,
                rol: 'USER'
            }
            usuario = new Usuario(data);
            await usuario.save();
        }

        if (!usuario.estado) {
            return res.status(401).json({
                msg: 'Hable con el administrador, usuario bloqueado'
            });
        }
        
        const token = await generarJWT(usuario.id);

        res.json({
            usuario,
            token
        });

    } catch (error) {
        console.log(`\n${error}\n`);
        res.status(500).json(`No se pudo verificar el token, check logs`);
    }

}


module.exports = {
    login, googleSignIn
}
