require('dotenv').config();
const loginIndex    = require('./auth/loginIndex');
const workflowIndex = require('./workFlow/workflowIndex');

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        const body = JSON.parse(event.body);
        const { type, data } = body;

        if (type.startsWith('auth/')) {
            const result = await loginIndex.handler(type, data);
            return { statusCode: 200, headers, body: JSON.stringify(result) };
        }

        if (type.startsWith('workflow/')) {
            const result = await workflowIndex.handler(type, data);
            return { statusCode: 200, headers, body: JSON.stringify(result) };
        }

        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: '不明なリクエストタイプです。' }),
        };
    } catch (err) {
        console.error('Lambda error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'サーバーエラーが発生しました。' }),
        };
    }
};
