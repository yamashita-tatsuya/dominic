const getBuppin = require('./getBuppin');
const saveBuppin = require('./saveBuppin');
const getShucchou = require('./getShucchou');
const saveShucchou = require('./saveShucchou');
const getShukkin = require('./getShukkin');
const getKaribarai = require('./getKaribarai');

exports.handler = async (type, data) => {
    switch (type) {
        case 'workflow/getBuppin':
            return await getBuppin.handler(data);
        case 'workflow/saveBuppin':
            return await saveBuppin.handler(data);
        case 'workflow/getShucchou':
            return await getShucchou.handler(data);
        case 'workflow/saveShucchou':
            return await saveShucchou.handler(data);
        case 'workflow/getShukkin':
            return await getShukkin.handler(data);
        case 'workflow/getKaribarai':
            return await getKaribarai.handler(data);
        default:
            return null;
    }
};
