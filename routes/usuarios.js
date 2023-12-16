
const { Router } = require('express');
const { check } = require('express-validator');

const {
    validarCampos,
    validarJWT,
    esAdminRole,
    tieneRole
} = require('../middlewares');

const {
    esRoleValido,
    emailExiste,
    existeUsuarioPorId
} = require('../helpers/db-validators');

const {
    ListarUsuarios,
    ActualizarUsuario,
    CrearUsuario,
    EliminarUsuario,
    usuariosPatch,
    BuscarUsuario,
    chequearPassword,
    CrearUsuarioPostulante,
    CrearUsuarioEmpresa
} = require('../controllers/usuarios');



const router = Router();

// Listar Usuarios
router.get('/', ListarUsuarios);

// // Crear Usuario
// router.post('/', [
//     check('nombre', 'El nombre es obligatorio').not().isEmpty(),
//     check('apellido', 'El apellido es obligatorio').not().isEmpty(),
//     check('password', 'El password debe de ser más de 6 letras').isLength({ min: 6 }),
//     check('correo', 'El correo no es válido').isEmail(),
//     check('correo').custom(emailExiste),
//     // check('rol', 'No es un rol válido').isIn(['ADMIN_ROLE','USER_ROLE']),
//     check('rol').custom(esRoleValido),
//     validarCampos
// ], CrearUsuario);

// Crear Usuario
router.post('/postulante', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    check('password', 'El password debe de ser más de 6 carácteres').isLength({ min: 6 }),
    check('correo', 'El correo no es válido').isEmail(),
    check('correo').custom(emailExiste),
    check('rol', 'No es un rol válido').isIn(['postulante']),
    // check('rol').custom(esRoleValido),
    validarCampos
], CrearUsuarioPostulante);

router.post('/empresa', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    check('password', 'El password debe de ser más de 6 carácteres').isLength({ min: 6 }),
    check('correo', 'El correo no es válido').isEmail(),
    check('correo').custom(emailExiste),
    check('nombreEmpresa', 'El campo nombreEmpresa es obligatorio').not().isEmpty(),
    check('razonSocial', 'El campo razonSocial es obligatorio').not().isEmpty(),
    check('direccion', 'El campo direccion es obligatorio').not().isEmpty(),
    check('telefono', 'El campo telefono es obligatorio').not().isEmpty(),
    check('rol', 'No es un rol válido').isIn(['empresa']),
    check('sector', 'El campo sector es obligatorio').not().isEmpty(),
    check('numero_trabajadores', 'El campo numero_trabajadores es obligatorio').not().isEmpty(),
    // check('rol').custom(esRoleValido),
    validarCampos
], CrearUsuarioEmpresa);

router.post('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], BuscarUsuario);


// ActualizarUsuario
router.put('/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    // check('rol').custom(esRoleValido),
    validarCampos
], ActualizarUsuario);


router.put('/checkPass/:id', [
    validarJWT,
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validarCampos
], chequearPassword)

// TODO:
router.patch('/', [
    validarJWT,
    validarCampos
], usuariosPatch);

// Eliminar Usuario
router.delete('/:id', [
    validarJWT,
    // esAdminRole,
    tieneRole('ADMIN', 'SUPER_USER'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validarCampos
], EliminarUsuario);



module.exports = router;