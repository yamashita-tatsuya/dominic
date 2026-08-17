const { KintoneRestAPIClient } = require('@kintone/rest-api-client');

const KINTONE_SUBDOMAIN = process.env.KINTONE_SUBDOMAIN;
const KINTONE_USER      = process.env.KINTONE_USER;
const KINTONE_PASSWORD  = process.env.KINTONE_PASSWORD;
const BUPIN_APP_ID      = 1917;
const GUEST_SPACE_ID    = 66;

/**
 * 物品注文を Kintone アプリ1917 に登録する
 * @param {{ form: object, rows: object[], userId: string, files: Array<{name:string, type:string, data:string}> }} data
 */
exports.handler = async (data) => {
    const { form, rows, userId, files = [] } = data;

    const client = new KintoneRestAPIClient({
        baseUrl: `https://${KINTONE_SUBDOMAIN}`,
        auth: {
            username: KINTONE_USER,
            password: KINTONE_PASSWORD,
        },
        guestSpaceId: GUEST_SPACE_ID,
    });

    // 添付ファイルをKintoneにアップロードしてfileKeyを取得
    const uploadedFiles = await Promise.all(
        files.map(async (f) => {
            const buffer = Buffer.from(f.data, 'base64');
            const { fileKey } = await client.file.uploadFile({
                file: {
                    name: f.name,
                    data: buffer,
                    contentType: f.mimeType || 'application/octet-stream',
                },
            });
            return { fileKey };
        })
    );

    // 明細サブテーブルの形式に変換
    const meisai = rows.map(row => ({
        value: {
            '品名・規格No': { value: row['品名・規格No'] || '' },
            '注文先':       { value: row['注文先']       || '' },
            'A組':          { value: row['A組']          || '' },
            'B組':          { value: row['B組']          || '' },
            'C組':          { value: row['C組']          || '' },
            '教員':         { value: row['教員']         || '' },
            '単価':         { value: row['単価']         || '' },
            '合計金額':     { value: row['合計金額']     || '' },
        },
    }));

    const record = {
        '注文者No':   { value: userId              || '' },
        '区分':       { value: form['区分']        || '' },
        '対象':       { value: form['対象']        || '' },
        '学年クラス': { value: form['学年クラス']  || '' },
        '費用科目':   { value: form['費用科目']    || '' },
        '使用目的':   { value: form['使用目的']    || '' },
        '使用予定日': { value: form['使用予定日']  || '' },
        '備考':       { value: form['備考']        || '' },
        'その他':     { value: form['その他']      || '' },
        '添付ファイル': { value: uploadedFiles },
        '明細':       { value: meisai },
    };

    try {
        const response = await client.record.addRecord({
            app: BUPIN_APP_ID,
            record,
        });
        return { id: response.id, revision: response.revision };
    } catch (err) {
        console.error('Kintone saveBuppin error:', err);
        throw new Error('注文の登録に失敗しました。');
    }
};
