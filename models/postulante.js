const { Schema } = require('mongoose');
const Usuario = require('./usuario');

const UsuarioPostulanteSchema = new Schema({
    ofertasAplicadas: [{
        type: Schema.Types.ObjectId,
        ref: 'Oferta',
        default: []
    }],
    curriculum: [{
        type: String,
        default: []
    }],
});

const Postulante = Usuario.discriminator('Postulante', UsuarioPostulanteSchema);

module.exports = Postulante;
