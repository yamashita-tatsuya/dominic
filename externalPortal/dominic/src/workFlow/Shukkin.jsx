import { useEffect, useState } from 'react';
import {
    Container, CssBaseline, Typography, Box, Divider, Button, Chip,
    TextField, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PaymentsIcon from '@mui/icons-material/Payments';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { apiPost } from '../https/useApiConnect';
import PageBreadcrumbs from '../components/PageBreadcrumbs';
import PageTitle from '../components/PageTitle';
import { formatDateCell } from '../utils/date';

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

// ── カラム定義 ──────────────────────────────────────────────
// TODO: kintone 出金申請アプリのフィールドコードに合わせて調整
const COL_DEFS = [
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
        width: 130,
        cellRenderer: StatusRenderer,
        cellStyle: { display: 'flex', alignItems: 'center' },
    },
    { field: '注文者', headerName: '申請者', flex: 1, minWidth: 140 },
];

// ── メインコンポーネント ────────────────────────────────────
const Shukkin = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoading();
    const [records, setRecords]         = useState([]);
    const [error, setError]             = useState('');
    const [quickFilter, setQuickFilter] = useState('');

    useEffect(() => {
        const fetchRecords = async () => {
            setLoading(true);
            try {
                const data = await apiPost('workflow/getShukkin', {});
                setRecords(data || []);
            } catch (err) {
                console.error('出金申請一覧取得エラー:', err);
                setError('出金申請一覧の取得に失敗しました。');
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    // TODO: kintone 出金申請アプリのフィールドコードに合わせて調整
    const rowData = records.map(r => ({
        レコード番号: r['レコード番号']?.value,
        申請日時:     r['申請日時']?.value,
        注文者:       r['注文者']?.value,
        ステータス:   r['ステータス']?.value,
        _record: r,
    }));

    return (
        <Container component="main" maxWidth="xl">
            <CssBaseline />
            <Box sx={{ mt: 4, mb: 8 }}>
                <PageBreadcrumbs items={[{ label: '出金申請' }]} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <PageTitle icon={PaymentsIcon} sx={{ mb: 0 }}>出金申請</PageTitle>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/shukkin/new')}>
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
                        rowHeight={48}
                        defaultColDef={{ sortable: true, filter: true, resizable: true, minWidth: 100 }}
                        quickFilterText={quickFilter}
                        localeText={AG_LOCALE_JA}
                        overlayNoRowsTemplate="<span>データがありません</span>"
                        rowStyle={{ cursor: 'pointer' }}
                    />
                </div>
            </Box>
        </Container>
    );
};

export default Shukkin;
