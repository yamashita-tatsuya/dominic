// 数値を「¥1,234,567」形式（3桁カンマ区切り）に整形。空・非数値は空文字を返す。
export const yen = (value) => {
    if (value === '' || value == null || isNaN(value)) return '';
    return `¥${Number(value).toLocaleString()}`;
};

// AG Grid の valueFormatter 用ラッパー（{ value } を受け取る）
export const yenCell = ({ value }) => yen(value);
