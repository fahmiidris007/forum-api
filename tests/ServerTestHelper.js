const Jwt = require('@hapi/jwt');
const AuthenticationsTableTestHelper = require('./AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('./UsersTableTestHelper');

const ServerTestHelper = {
  async getAccessToken() {
    const userPayload = {
      id: 'user-123',
      username: 'Username',
    };
    await UsersTableTestHelper.addUser(userPayload);
    const accessToken = Jwt.token.generate(
      userPayload,
      process.env.ACCESS_TOKEN_KEY,
    );
    const refreshToken = Jwt.token.generate(
      userPayload,
      process.env.REFRESH_TOKEN_KEY,
    );
    await AuthenticationsTableTestHelper.addToken(refreshToken);
    return accessToken;
  },

  async cleanTable() {
    AuthenticationsTableTestHelper.cleanTable();
    UsersTableTestHelper.cleanTable();
  },
};

module.exports = ServerTestHelper;
