const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const RefreshToken = db.refreshToken;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
    if (!req.body) {
        return res.status(500).json({ ERROR: "Body not found " });
    }
    // Save User to Database
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 16),
    })
        .then((user) => {
            if (req.body.roles) {
                Role.findAll({
                    where: {
                        name: {
                            [Op.or]: req.body.roles,
                        },
                    },
                }).then((roles) => {
                    user.setRoles(roles).then(() => {
                        res
                            .status(200)
                            .json({ message: "User was registered successfully!" });
                    });
                });
            } else {
                // user role = 1
                user.setRoles([1]).then(() => {
                    res
                        .status(200)
                        .json({ message: "User was registered successfully!" });
                });
            }
        })
        .catch((err) => {
            res.status(500).json({ message: err.message });
        });
};

exports.signin = (req, res) => {
    if (req.query === undefined) {
        return res.status(404).json({ message: "Request parameters are required !" });
    } else {
        User.findOne({
            where: {
                username: req.query.username,
            },
        })
            .then((user) => {
                if (!user) {
                    return res.status(404).json({ message: "User Not found." });
                }

                var passwordIsValid = bcrypt.compareSync(
                    req.query.password,
                    user.password
                );

                if (!passwordIsValid) {
                    return res.status(401).json({
                        accessToken: null,
                        message: "Invalid Password!",
                    });
                }

                var token = jwt.sign({ id: user.id }, config.secret, {
                    expiresIn: config.jwtExpiration, // 1 hours
                });

                let refreshToken = await RefreshToken.createToken(user);

                var authorities = [];
                user.getRoles().then((roles) => {
                    for (let i = 0; i < roles.length; i++) {
                        authorities.push("ROLE_" + roles[i].name.toUpperCase());
                    }
                    res.status(200).json({
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        roles: authorities,
                        accessToken: token,
                        refreshToken: refreshToken,
                    });
                });
            })
            .catch((err) => {
                res.status(500).json({ message: err.message });
            });
    }
};
