// kintone の日時（UTC ISO）を日本時間の「yyyy-mm-dd」に整形（表示用）
// AG Grid の valueFormatter として使う場合は formatDateCell を利用する。
export const formatDate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d)) return value;
    // en-CA ロケールは yyyy-mm-dd 形式
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(d);
};

// AG Grid valueFormatter 用ラッパー（{ value } を受け取る）
export const formatDateCell = ({ value }) => formatDate(value);
