import { useEffect, useState } from 'react';
import {
    Container, CssBaseline, Typography, Box, Divider, Button, Chip, IconButton,
    TextField, InputAdornment, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FlightIcon from '@mui/icons-material/Flight';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { apiPost } from '../https/useApiConnect';
import PageBreadcrumbs from '../components/PageBreadcrumbs';
import PageTitle from '../components/PageTitle';
import DetailDialog from '../components/DetailDialog';
import { formatDate, formatDateCell } from '../utils/date';
import { yen, yenCell } from '../utils/currency';
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
    <Tooltip title="コピーして新規申請">
        <span>
            <IconButton
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    context.navigate('/shucchou/new', { state: { copyFrom: data._record } });
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
    { field: 'レコード番号', headerName: 'No.', width: 80, hide: true },
    {
        field: '申請日時',
        headerName: '申請日',
        width: 130,
        valueFormatter: formatDateCell,
    },
    {
        field: 'ステータス',
        headerName: 'ステータス',
        width: 120,
        cellRenderer: StatusRenderer,
        cellStyle: { display: 'flex', alignItems: 'center' },
    },
    { field: '区分',       headerName: '区分',     width: 100 },
    { field: '注文者',     headerName: '申請者',   flex: 1, minWidth: 120 },
    { field: '用務',       headerName: '用務',     flex: 1, minWidth: 160 },
    { field: '出張先',     headerName: '出張先',   flex: 1, minWidth: 140 },
    { field: '出発日',     headerName: '出発日',   width: 130, valueFormatter: formatDateCell },
    { field: '帰宅日',     headerName: '帰宅・帰校日', width: 140, valueFormatter: formatDateCell },
    { field: '旅費合計',   headerName: '旅費合計', width: 120, valueFormatter: yenCell, type: 'rightAligned' },
];

// ── 詳細ダイアログ用データ生成 ──────────────────────────────
const time = (v) => v || '';
const buildInfo = (record) => [
    ['申請日',   formatDate(record['申請日時']?.value)],
    ['区分',     record['区分']?.value],
    ['社員番号', record['社員番号']?.value],
    ['用務',     record['用務']?.value],
    ['出張先',   record['出張先']?.value],
    ['出発',     [formatDate(record['出発日']?.value), time(record['出発時刻']?.value)].filter(Boolean).join(' ')],
    ['帰宅・帰校', [formatDate(record['帰宅日']?.value), time(record['帰宅時刻']?.value)].filter(Boolean).join(' ')],
    ['発令日',   formatDate(record['発令日']?.value)],
    ['食事支給', record['食事支給']?.value],
    ['旅費合計', yen(record['旅費合計']?.value)],
    ['備考',     record['備考']?.value],
].filter(([, v]) => v);

const MEISAI_COLUMNS = [
    { header: '科目', value: (v) => v['科目']?.value },
    { header: '金額', align: 'right', value: (v) => yen(v['金額']?.value) },
    { header: '摘要', value: (v) => v['摘要']?.value },
];

// ── メインコンポーネント ────────────────────────────────────
const Shucchou = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoading();
    const [records, setRecords]               = useState([]);
    const [error, setError]                   = useState('');
    const [quickFilter, setQuickFilter]       = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        const fetchRecords = async () => {
            setLoading(true);
            try {
                const data = await apiPost('workflow/getShucchou', {});
                setRecords(data || []);
            } catch (err) {
                console.error('出張申請一覧取得エラー:', err);
                setError('出張申請一覧の取得に失敗しました。');
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    const rowData = records.map(r => ({
        レコード番号: r['レコード番号']?.value,
        申請日時:     r['申請日時']?.value,
        区分:         r['区分']?.value,
        注文者:       r['注文者']?.value,
        用務:         r['用務']?.value,
        出張先:       r['出張先']?.value,
        出発日:       r['出発日']?.value,
        帰宅日:       r['帰宅日']?.value,
        旅費合計:     r['旅費合計']?.value,
        ステータス:   r['ステータス']?.value,
        _record: r,
    }));

    return (
        <Container component="main" maxWidth="xl">
            <CssBaseline />
            <Box sx={{ mt: 4, mb: 8 }}>
                <PageBreadcrumbs items={[{ label: '出張申請' }]} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <PageTitle icon={FlightIcon} sx={{ mb: 0 }}>出張申請</PageTitle>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/shucchou/new')}>
                        新規申請
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
                            if (event.target.closest('button')) return;
                            setSelectedRecord(data._record);
                        }}
                    />
                </div>
            </Box>

            {selectedRecord && (
                <DetailDialog
                    open
                    onClose={() => setSelectedRecord(null)}
                    status={selectedRecord['ステータス']?.value}
                    info={buildInfo(selectedRecord)}
                    meisai={{ columns: MEISAI_COLUMNS, rows: selectedRecord['明細']?.value ?? [] }}
                />
            )}
        </Container>
    );
};

export default Shucchou;
