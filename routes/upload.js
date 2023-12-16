const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos, validarArchivoSubir } = require('../middlewares');
const { actualizarImagenCloudinary, agregarCurriculum, eliminarCurriculum } = require('../controllers/upload');


const router = Router();


const extensionesPermitidasImagen = ['jpg', 'jpeg', 'png'];

router.put('/imagen/:id', [
    validarArchivoSubir(extensionesPermitidasImagen),
    check('id', 'El id debe de ser de mongo').isMongoId(),
    validarCampos
], actualizarImagenCloudinary)


const extensionesPermitidasCurriculum = ['pdf'];

router.post('/curriculum/:id', [
    validarArchivoSubir(extensionesPermitidasCurriculum),
    check('id', 'El id debe de ser de mongo').isMongoId(),
    validarCampos
], agregarCurriculum)

router.delete('/curriculum/:id', [
    check('id', 'El id debe de ser de mongo').isMongoId(),
    check('url', 'La URL es requerida').notEmpty(),
    validarCampos
], eliminarCurriculum);


module.exports = router;