const login = require('./login');

exports.handler = async (type, data) => {
    switch (type) {
        case 'auth/login':
            return await login.handler(data);
        default:
            return null;
    }
};
