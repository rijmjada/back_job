const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos, validarJWT, validarUsuarioAutorizado } = require('../middlewares/');

const {
    crearOferta,
    listarOfertas,
    actualizarOferta,
    eliminarOferta,
    buscarOfertaPorID,
    ListarSectores,
    ListarFechas,
    ListarModalidades,
    listaOfertasPorTipoDeJornada
} = require('../controllers/ofertas')

const router = Router();


// LISTA TODAS LAS OFERTAS
router.get('/', listarOfertas);

router.get('/sectores', ListarSectores);

// Endpoint para obtener ofertas por fecha
router.get('/fechas', ListarFechas);

router.get('/modalidades', ListarModalidades);

router.get('/jornadas', listaOfertasPorTipoDeJornada);



//TODO: BUSCAR UNA OFERTA POR ID
router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], buscarOfertaPorID);



// CREAR UNA OFERTA NUEVA
router.post('/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('titulo', 'El campo titulo es obligatorio').isLength({ min: 6 }),
    check('ubicacion', 'El campo ubicacion es obligatorio').not().isEmpty(),
    check('empresa', 'El campo empresa es obligatorio').not().isEmpty(),
    check('descripcion', 'El campo descripcion es obligatorio').not().isEmpty(),
    check('modalidad', 'El campo modalidad es obligatorio').not().isEmpty(),
    check('salario', 'El campo salario debe ser un número').isNumeric(),
    check('jornada', 'El campo jornada es obligatorio').not().isEmpty(),
    check('sector', 'El campo sector es obligatorio').not().isEmpty(),
    validarCampos
], crearOferta);


//TODO: ACTUALIZAR OFERTA
router.put('/:id', actualizarOferta);


//  ELIMINAR OFERTA
router.delete('/:id', [
    check('id', 'El id de la oferta es obligatorio').isMongoId(),
    validarUsuarioAutorizado,
    validarCampos
], eliminarOferta);



module.exports = router;