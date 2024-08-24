const express = require("express");
const {AuthController} = require('../controller/AuthController');

const AuthRoutes = express.Router();

AuthRoutes.post("/api/auth", AuthController);


module.exports = AuthRoutes;