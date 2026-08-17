const getBuppin = require('./getBuppin');
const saveBuppin = require('./saveBuppin');

exports.handler = async (type, data) => {
    switch (type) {
        case 'workflow/getBuppin':
            return await getBuppin.handler(data);
        case 'workflow/saveBuppin':
            return await saveBuppin.handler(data);
        default:
            return null;
    }
};
