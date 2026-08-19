const { KintoneRestAPIClient } = require('@kintone/rest-api-client');
const crypto = require('crypto');

const KINTONE_SUBDOMAIN = process.env.KINTONE_SUBDOMAIN;   // 例: xxx.cybozu.com
const KINTONE_USER     = process.env.KINTONE_USER;         // kintoneログインID
const KINTONE_PASSWORD = process.env.KINTONE_PASSWORD;     // kintoneパスワード
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'dominic-secret-key';
const KINTONE_APP_ID = 1915;

/**
 * Kintone アプリ1915 を社員番号とパスワードで検索してログイン処理を行う
 * @param {{ id: string, password: string }} data
 * @returns {{ token: string, user: object } | null}
 */
exports.handler = async (data) => {
    const { id, password } = data;

    if (!id || !password) {
        return null;
    }

    const client = new KintoneRestAPIClient({
        baseUrl: `https://${KINTONE_SUBDOMAIN}`,
        auth: {
            username: KINTONE_USER,
            password: KINTONE_PASSWORD,
        },
        guestSpaceId: 66,
    });

    // Kintone レコード検索
    let records;
    try {
        const response = await client.record.getRecords({
            app: KINTONE_APP_ID,
            query: `社員番号 = "${id}" and パスワード = "${password}"`,
            fields: ['レコード番号', '社員番号', '氏名'],
        });
        records = response.records;
    } catch (err) {
        console.error('Kintone API error:', err);
        throw new Error('Kintone接続エラー');
    }

    if (!records || records.length === 0) {
        // 認証失敗
        return null;
    }

    const record = records[0];
    const name      = record['氏名']?.value || '';
    const recordId  = record['レコード番号']?.value || '';

    // セッショントークン生成（HMAC-SHA256）
    const payload = JSON.stringify({
        id,
        recordId,
        name,
        iat: Date.now(),
    });
    const token = crypto
        .createHmac('sha256', TOKEN_SECRET)
        .update(payload)
        .digest('hex');

    return {
        token,
        user: {
            id,
            name,
            recordId,
        },
    };
};
