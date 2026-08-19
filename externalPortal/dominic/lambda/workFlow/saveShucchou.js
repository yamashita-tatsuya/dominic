const { KintoneRestAPIClient } = require('@kintone/rest-api-client');

const KINTONE_SUBDOMAIN = process.env.KINTONE_SUBDOMAIN;
const KINTONE_USER      = process.env.KINTONE_USER;
const KINTONE_PASSWORD  = process.env.KINTONE_PASSWORD;
const SHUCCHOU_APP_ID   = 1927;
const GUEST_SPACE_ID    = 66;

/**
 * 出張申請を Kintone アプリ1927 に登録する
 * @param {{ form: object, rows: object[], userId: string }} data
 */
exports.handler = async (data) => {
    const { form, rows = [], userId } = data;

    const client = new KintoneRestAPIClient({
        baseUrl: `https://${KINTONE_SUBDOMAIN}`,
        auth: {
            username: KINTONE_USER,
            password: KINTONE_PASSWORD,
        },
        guestSpaceId: GUEST_SPACE_ID,
    });

    // 明細サブテーブルの形式に変換
    const meisai = rows.map(row => ({
        value: {
            '科目': { value: row['科目'] || '' },
            '金額': { value: row['金額'] || '' },
            '摘要': { value: row['摘要'] || '' },
        },
    }));

    // 注文者No はログインID（社員番号）をセット。ルックアップにより注文者(氏名)等は自動コピーされる
    // 旅費合計は kintone の計算フィールド（SUM(金額)）のため、API では書き込まない
    const record = {
        '注文者No':   { value: userId              || '' },
        '区分':       { value: form['区分']        || '' },
        '用務':       { value: form['用務']        || '' },
        '出張先':     { value: form['出張先']      || '' },
        '出発日':     { value: form['出発日']      || '' },
        '出発時刻':   { value: form['出発時刻']    || '' },
        '帰宅日':     { value: form['帰宅日']      || '' },
        '帰宅時刻':   { value: form['帰宅時刻']    || '' },
        '発令日':     { value: form['発令日']      || '' },
        '食事支給':   { value: form['食事支給']    || '無' },
        '備考':       { value: form['備考']        || '' },
        '明細':       { value: meisai },
    };

    try {
        const response = await client.record.addRecord({
            app: SHUCCHOU_APP_ID,
            record,
        });
        return { id: response.id, revision: response.revision };
    } catch (err) {
        console.error('Kintone saveShucchou error:', err);
        throw new Error('出張申請の登録に失敗しました。');
    }
};
