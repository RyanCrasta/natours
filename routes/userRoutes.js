const express = require('express');
const userController = require('./../controllers/userController.js');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);
router.get('/logout', authController.logout);

// will receive only email
router.post('/forgotPassword', authController.forgotPassword);

// will receive token and new password
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);
// it will protect all the routes from this point
// coz middle ware run in sequence

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));
// users route
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
