const { Router } = require('express');
const { LoginUser, RegisterUser } = require('../controllers/user.controller');
const upload = require('../middleware/multer');  // Assuming you already have multer set up

const UserRouter = Router();

// Register route with file handling
UserRouter.post(
  '/register',
  upload.fields([
    { name: 'profilepic', maxCount: 1 },
    { name: 'profilepdf', maxCount: 1 }
  ]),
  RegisterUser
);

// Login route
UserRouter.post('/login', LoginUser);

module.exports = UserRouter;
