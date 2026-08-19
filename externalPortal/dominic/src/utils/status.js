// ステータス文字列から MUI の色名を判定（一覧Chip・詳細ダイアログ共通）
export const statusColor = (s) => {
    if (!s) return 'default';
    if (s.includes('承認') || s.includes('完了')) return 'success';
    if (s.includes('申請') || s.includes('却下')) return 'error';
    return 'warning';
};
