const users = require('../../../db');

module.exports = framework => {
    return [
        {
            session: {
                sessionName: 'X-Session-Token',
                ttl: 60 * 60 * 24 * 30 * 6,
                alwaysSend: true,
                loadUser: (sessionData) => {
                    const index = users.findIndex(user => user.id === sessionData.userId);
                    return users[index];
                },
            },
        },
        {
            framework,
            transport: 'header',
        }
    ];
};
