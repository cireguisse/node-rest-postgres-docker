const config = require("../config/auth.config");
const uuid = require('uuid');

module.exports = (sequelize, Sequelize) => {
  const RefreshToken = sequelize.define("refreshToken", {
    token_id: {
      type: Sequelize.STRING
    },
    expiryDate: {
      type: Sequelize.DATE
    },
  });

  RefreshToken.createToken = async function (user) {
    let expiredAt = new Date();

    expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);

    let refreshToken = await this.create({
      token_id: uuid.v4(),
      userId: user.id,
      expiryDate: expiredAt.getTime(),
    });

    return refreshToken.token;
  };

  RefreshToken.verifyExpiration = (token) => {
    return token.expiryDate.getTime() < new Date().getTime();
  };

  return RefreshToken;
};