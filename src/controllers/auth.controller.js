const authService = require('../services/auth.service');

exports.signup = async (req, res) => {
    res.status(201).json(await authService.signup(req.body));
};

exports.signin = async (req, res) => {
    res.status(200).json(await authService.signin(req.body));
};

exports.signinAdmin = async (req, res) => {
    res.status(200).json(await authService.signinAdmin(req.body));
};
