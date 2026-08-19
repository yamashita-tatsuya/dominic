import { useEffect, useState } from 'react';
import {
    Container, CssBaseline, Typography, Box, Divider, Button, Chip, IconButton,
    TextField, InputAdornment, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { apiPost } from '../https/useApiConnect';
import PageBreadcrumbs from '../components/PageBreadcrumbs';
import PageTitle from '../components/PageTitle';
import DetailDialog from '../components/DetailDialog';
import { formatDate, formatDateCell } from '../utils/date';
import { yen } from '../utils/currency';
import { statusColor } from '../utils/status';

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
const StatusRenderer = ({ value }) =>
    value
        ? <Chip label={value} color={statusColor(value)} size="small" />
        : <span>-</span>;

const CopyButtonRenderer = ({ data, context }) => (
    <Tooltip title="コピーして新規登録">
        <span>
            <IconButton
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    context.navigate('/bupin/new', { state: { copyFrom: data._record } });
                }}
                sx={{ color: 'primary.main' }}
            >
                <ContentCopyIcon fontSize="small" />
            </IconButton>
        </span>
    </Tooltip>
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
        field: '注文日時',
        headerName: '注文日',
        width: 130,
        valueFormatter: formatDateCell,
    },
    {
        field: 'ステータス',
        headerName: 'ステータス',
        width: 130,
        cellRenderer: StatusRenderer,
        cellStyle: { display: 'flex', alignItems: 'center' },
    },
    { field: '注文者',     headerName: '注文者',    flex: 1, minWidth: 140 },
    { field: '学年クラス', headerName: '学年クラス', flex: 1, minWidth: 140 },
    { field: '区分',       headerName: '区分',       width: 100 },
    { field: '対象',       headerName: '対象',       width: 120 },
    { field: '費用科目',   headerName: '費用科目',   flex: 1, minWidth: 160 },
    { field: '使用予定日', headerName: '使用予定日', width: 120 },
];

// ── 詳細ダイアログ用データ生成 ──────────────────────────────
const buildInfo = (record) => [
    ['注文日',     formatDate(record['注文日時']?.value)],
    ['区分',       record['区分']?.value],
    ['費用科目',   record['費用科目']?.value],
    ['対象',       record['対象']?.value],
    ['学年クラス', record['学年クラス']?.value],
    ['使用予定日', record['使用予定日']?.value],
    ['使用目的',   record['使用目的']?.value],
    ['備考',       record['備考']?.value],
].filter(([, v]) => v);

const MEISAI_COLUMNS = [
    { header: '品名・規格No', value: (v) => v['品名・規格No']?.value },
    { header: '注文先',       value: (v) => v['注文先']?.value },
    { header: 'A組', align: 'right', value: (v) => v['A組']?.value },
    { header: 'B組', align: 'right', value: (v) => v['B組']?.value },
    { header: 'C組', align: 'right', value: (v) => v['C組']?.value },
    { header: '教員', align: 'right', value: (v) => v['教員']?.value },
    { header: '単価', align: 'right', value: (v) => yen(v['単価']?.value) },
    { header: '合計金額', align: 'right', value: (v) => yen(v['合計金額']?.value) },
];

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
        注文日時:     r['注文日時']?.value,
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
                <PageBreadcrumbs items={[{ label: '物品注文' }]} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <PageTitle icon={ShoppingCartIcon} sx={{ mb: 0 }}>物品注文</PageTitle>
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
                    placeholder="かんたん検索"
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
                        defaultColDef={{ sortable: true, filter: true, resizable: true, minWidth: 100 }}
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

            {selectedRecord && (
                <DetailDialog
                    open
                    title="注文詳細"
                    onClose={() => setSelectedRecord(null)}
                    status={selectedRecord['ステータス']?.value}
                    info={buildInfo(selectedRecord)}
                    meisai={{ columns: MEISAI_COLUMNS, rows: selectedRecord['明細']?.value ?? [] }}
                />
            )}
        </Container>
    );
};

export default BuppinOrder;
