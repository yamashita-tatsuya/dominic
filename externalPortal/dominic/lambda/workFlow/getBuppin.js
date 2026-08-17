const { KintoneRestAPIClient } = require('@kintone/rest-api-client');

const KINTONE_SUBDOMAIN = process.env.KINTONE_SUBDOMAIN;
const KINTONE_USER     = process.env.KINTONE_USER;
const KINTONE_PASSWORD = process.env.KINTONE_PASSWORD;
const BUPIN_APP_ID      = 1917;
const GUEST_SPACE_ID    = 66;

exports.handler = async () => {
    const client = new KintoneRestAPIClient({
        baseUrl: `https://${KINTONE_SUBDOMAIN}`,
        auth: {
            username: KINTONE_USER,
            password: KINTONE_PASSWORD,
        },
        guestSpaceId: GUEST_SPACE_ID,
    });

    try {
        const response = await client.record.getAllRecords({
            app: BUPIN_APP_ID,
            orderBy: 'レコード番号 desc',
        });
        return response;
    } catch (err) {
        console.error('Kintone bupin getList error:', err);
        throw new Error('物品一覧の取得に失敗しました。');
    }
};
