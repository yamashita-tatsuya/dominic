import { useEffect, useState } from 'react';
import {
    Container, CssBaseline, Typography, Box, Divider, Button, Chip, IconButton,
    TextField, InputAdornment,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { apiPost } from '../https/useApiConnect';

ModuleRegistry.registerModules([AllCommunityModule]);

// ── AG Grid 日本語ロケール ───────────────────────────────────
const AG_LOCALE_JA = {
    filterOoo: '検索...', equals: '等しい', notEqual: '等しくない',
    lessThan: 'より小さい', greaterThan: 'より大きい',
    lessThanOrEqual: '以下', greaterThanOrEqual: '以上',
    inRange: '範囲内', contains: '含む', notContains: '含まない',
    startsWith: 'で始まる', endsWith: 'で終わる',
    blank: '空白', notBlank: '空白でない',
    andCondition: 'かつ', orCondition: 'または',
    applyFilter: '適用', resetFilter: 'リセット',
    clearFilter: 'クリア', cancelFilter: 'キャンセル',
    columns: '列', filters: 'フィルター',
    sortAscending: '昇順', sortDescending: '降順', sortUnSort: '解除',
    pinColumn: '列を固定', pinLeft: '左に固定', pinRight: '右に固定', noPin: '固定解除',
    autosizeThisColumn: 'この列を自動調整', autosizeAllColumns: 'すべて自動調整',
    resetColumns: '列をリセット', expandAll: 'すべて展開', collapseAll: 'すべて折りたたむ',
    copy: 'コピー', copyWithHeaders: 'ヘッダーと共にコピー', paste: '貼り付け',
    export: 'エクスポート', csvExport: 'CSV', excelExport: 'Excel',
    noRowsToShow: 'データがありません', loadingOoo: '読み込み中...',
    page: 'ページ', to: '〜', of: '/', next: '次へ', last: '最後', first: '最初', previous: '前へ',
};

// ── セルレンダラー ──────────────────────────────────────────
const statusColor = (s) => {
    if (!s) return 'default';
    if (s.includes('承認') || s.includes('完了')) return 'success';
    if (s.includes('申請') || s.includes('却下')) return 'error';
    return 'warning';
};

const StatusRenderer = ({ value }) =>
    value
        ? <Chip label={value} color={statusColor(value)} size="small" />
        : <span>-</span>;

const CopyButtonRenderer = ({ data, context }) => (
    <IconButton
        size="small"
        title="コピーして新規登録"
        onClick={(e) => {
            e.stopPropagation();
            context.navigate('/bupin/new', { state: { copyFrom: data._record } });
        }}
        sx={{ color: 'primary.main' }}
    >
        <ContentCopyIcon fontSize="small" />
    </IconButton>
);

// ── カラム定義 ──────────────────────────────────────────────
const COL_DEFS = [
    {
        headerName: '',
        colId: '_copy',
        width: 52,
        sortable: false,
        filter: false,
        cellRenderer: CopyButtonRenderer,
        cellStyle: { display: 'flex', alignItems: 'center' },
    },
    { field: 'レコード番号', headerName: 'No.',      width: 80,  hide: true },
    { field: '品名',         headerName: '品名',      hide: true }, // quickFilter用
    {
        field: 'ステータス',
        headerName: 'ステータス',
        width: 130,
        cellRenderer: StatusRenderer,
        cellStyle: { display: 'flex', alignItems: 'center' },
    },
    { field: '注文者',     headerName: '注文者',    flex: 1 },
    { field: '学年クラス', headerName: '学年クラス', flex: 1 },
    { field: '区分',       headerName: '区分',       width: 100 },
    { field: '対象',       headerName: '対象',       width: 120 },
    { field: '費用科目',   headerName: '費用科目',   flex: 1 },
    { field: '使用予定日', headerName: '使用予定日', width: 120 },
];

// ── 詳細ダイアログ ──────────────────────────────────────────
const DetailDialog = ({ record, onClose }) => {
    if (!record) return null;
    const meisai = record['明細']?.value ?? [];

    const info = [
        ['注文者',     record['注文者']?.value],
        ['学年クラス', record['学年クラス']?.value],
        ['区分',       record['区分']?.value],
        ['対象',       record['対象']?.value],
        ['費用科目',   record['費用科目']?.value],
        ['使用予定日', record['使用予定日']?.value],
        ['使用目的',   record['使用目的']?.value],
        ['備考',       record['備考']?.value],
        ['その他',     record['その他']?.value],
    ].filter(([, v]) => v);

    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                詳細　No.{record['レコード番号']?.value}
                {record['ステータス']?.value && (
                    <Chip
                        label={record['ステータス'].value}
                        color={statusColor(record['ステータス'].value)}
                        size="small"
                        sx={{ ml: 1 }}
                    />
                )}
                <IconButton size="small" onClick={onClose} sx={{ ml: 'auto' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {/* 基本情報 */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    {info.map(([label, val]) => (
                        <Box key={label} sx={{ minWidth: 160 }}>
                            <Typography variant="caption" color="text.secondary">{label}</Typography>
                            <Typography variant="body2">{val}</Typography>
                        </Box>
                    ))}
                </Box>

                {/* 明細テーブル */}
                {meisai.length > 0 && (
                    <>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>明細</Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                                        <TableCell>品名・規格No</TableCell>
                                        <TableCell>注文先</TableCell>
                                        <TableCell align="right">A組</TableCell>
                                        <TableCell align="right">B組</TableCell>
                                        <TableCell align="right">C組</TableCell>
                                        <TableCell align="right">教員</TableCell>
                                        <TableCell align="right">単価</TableCell>
                                        <TableCell align="right">合計金額</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {meisai.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{row.value['品名・規格No']?.value}</TableCell>
                                            <TableCell>{row.value['注文先']?.value}</TableCell>
                                            <TableCell align="right">{row.value['A組']?.value}</TableCell>
                                            <TableCell align="right">{row.value['B組']?.value}</TableCell>
                                            <TableCell align="right">{row.value['C組']?.value}</TableCell>
                                            <TableCell align="right">{row.value['教員']?.value}</TableCell>
                                            <TableCell align="right">
                                                {row.value['単価']?.value
                                                    ? `¥${Number(row.value['単価'].value).toLocaleString()}`
                                                    : ''}
                                            </TableCell>
                                            <TableCell align="right">
                                                {row.value['合計金額']?.value
                                                    ? `¥${Number(row.value['合計金額'].value).toLocaleString()}`
                                                    : ''}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>閉じる</Button>
            </DialogActions>
        </Dialog>
    );
};

// ── メインコンポーネント ────────────────────────────────────
const BuppinOrder = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoading();
    const [records, setRecords]           = useState([]);
    const [error, setError]               = useState('');
    const [quickFilter, setQuickFilter]   = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        const fetchRecords = async () => {
            setLoading(true);
            try {
                const data = await apiPost('workflow/getBuppin', {});
                setRecords(data || []);
            } catch (err) {
                console.error('物品一覧取得エラー:', err);
                setError('物品一覧の取得に失敗しました。');
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    const rowData = records.map(r => ({
        レコード番号: r['レコード番号']?.value,
        注文者:       r['注文者']?.value,
        学年クラス:   r['学年クラス']?.value,
        区分:         r['区分']?.value,
        対象:         r['対象']?.value,
        費用科目:     r['費用科目']?.value,
        使用予定日:   r['使用予定日']?.value,
        ステータス:   r['ステータス']?.value,
        品名: (r['明細']?.value ?? [])
            .map(m => m.value['品名・規格No']?.value)
            .filter(Boolean)
            .join(' '),
        _record: r,
    }));

    return (
        <Container component="main" maxWidth="xl">
            <CssBaseline />
            <Box sx={{ mt: 4, mb: 8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShoppingCartIcon />
                        <Typography variant="h5">物品注文</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/bupin/new')}>
                        新規注文
                    </Button>
                </Box>
                <Divider sx={{ mb: 3 }} />

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
                )}

                <TextField
                    size="small"
                    placeholder="品名で検索"
                    value={quickFilter}
                    onChange={e => setQuickFilter(e.target.value)}
                    sx={{ mb: 1, width: 280 }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                <div style={{ height: 520, width: '100%' }}>
                    <AgGridReact
                        theme={themeQuartz}
                        rowData={rowData}
                        columnDefs={COL_DEFS}
                        context={{ navigate }}
                        rowHeight={48}
                        defaultColDef={{ sortable: true, filter: true, resizable: true }}
                        quickFilterText={quickFilter}
                        localeText={AG_LOCALE_JA}
                        overlayNoRowsTemplate="<span>データがありません</span>"
                        rowStyle={{ cursor: 'pointer' }}
                        onRowClicked={({ data, event }) => {
                            // コピーボタン列クリックは除外
                            if (event.target.closest('button')) return;
                            setSelectedRecord(data._record);
                        }}
                    />
                </div>
            </Box>

            <DetailDialog
                record={selectedRecord}
                onClose={() => setSelectedRecord(null)}
            />
        </Container>
    );
};

export default BuppinOrder;
