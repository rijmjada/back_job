const { Schema, model } = require('mongoose');

const OfertaSchema = Schema({

    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },

    postulantes: [{
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        default: []
    }],

    empresa: {
        type: String,
        required: [true, 'El campo empresa es obligatorio']
    },

    titulo: {
        type: String,
        required: [true, 'El campo titulo es obligatorio']
    },

    ubicacion: {
        type: String,
        required: [true, 'El campo ubicacion es obligatorio']
    },

    descripcion: {
        type: String,
        required: [true, 'El campo descripcion es obligatorio']
    },

    salario: {
        type: Number,
        required: [true, 'El campo salario es obligatorio']
    },

    modalidad: {
        type: String,
        require: [true, 'El campo salario es obligatorio']
    },

    estado: {
        type: Boolean,
        default: true
    },

    sector: {
        type: String,
        required: [true, 'El campo ubicacion es obligatorio']
    },

    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

OfertaSchema.methods.toJSON = function () {
    const { __v, _id, ...oferta } = this.toObject();
    oferta.uid = _id;
    return oferta;
};

module.exports = model('Oferta', OfertaSchema);
