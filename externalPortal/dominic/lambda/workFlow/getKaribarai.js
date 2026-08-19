const { KintoneRestAPIClient } = require('@kintone/rest-api-client');

const KINTONE_SUBDOMAIN = process.env.KINTONE_SUBDOMAIN;
const KINTONE_USER      = process.env.KINTONE_USER;
const KINTONE_PASSWORD  = process.env.KINTONE_PASSWORD;
// TODO: 仮払申請アプリの実際のアプリIDに置き換える
const KARIBARAI_APP_ID  = process.env.KARIBARAI_APP_ID || 0;
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
            app: KARIBARAI_APP_ID,
            orderBy: 'レコード番号 desc',
        });
        return response;
    } catch (err) {
        console.error('Kintone karibarai getList error:', err);
        throw new Error('仮払申請一覧の取得に失敗しました。');
    }
};
