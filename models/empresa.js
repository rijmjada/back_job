const { Schema } = require('mongoose');
const Usuario = require('./usuario');

const UsuarioEmpresaSchema = new Schema({
    ofertasPublicadas: [{
        type: Schema.Types.ObjectId,
        ref: 'Oferta',
        default: []
    }],
    nombreEmpresa: {
        type: String,
        required: [true, 'El campo nombre de empresa es obligatorio']
    },
    razonSocial: {
        type: String,
        required: [true, 'El campo razon social es obligatorio']
    },
    direccion: {
        type: String,
        required: [true, 'El campo direccion es obligatorio']
    },
    telefono: {
        type: String,
        required: [true, 'El campo teléfono es obligatorio']
    },
    sector: {
        type: String,
        required: [true, 'El campo sector es obligatorio']
    },
    numero_trabajadores: {
        type: String,
        required: [true, 'El campo numero_trabajadores es obligatorio']
    },
});

const Empresa = Usuario.discriminator('Empresa', UsuarioEmpresaSchema);

module.exports = Empresa;
