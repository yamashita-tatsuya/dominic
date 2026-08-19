import { useState, useContext, useRef } from 'react';
import {
    Container, CssBaseline, Typography, Box, Paper, Divider,
    TextField, MenuItem, Button, IconButton, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Alert, Chip, Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { apiPost } from '../https/useApiConnect';
import AuthContext from '../main';
import PageBreadcrumbs from '../components/PageBreadcrumbs';
import PageTitle from '../components/PageTitle';
import FormActions from '../components/FormActions';
import { yen } from '../utils/currency';

// Kintone レコード → フォーム初期値に変換
const recordToForm = (r) => ({
    '区分':       r['区分']?.value       || '',
    '対象':       r['対象']?.value       || '',
    '学年クラス': r['学年クラス']?.value || '',
    '費用科目':   r['費用科目']?.value   || '',
    '使用目的':   r['使用目的']?.value   || '',
    '使用予定日': r['使用予定日']?.value || '',
    '備考':       r['備考']?.value       || '',
    'その他':     r['その他']?.value     || '',
});

const recordToRows = (r) => {
    const meisai = r['明細']?.value;
    if (!meisai?.length) return null;
    return meisai.map(m => ({
        '品名・規格No': m.value['品名・規格No']?.value || '',
        '注文先':       m.value['注文先']?.value       || '',
        'A組':          m.value['A組']?.value          || '',
        'B組':          m.value['B組']?.value          || '',
        'C組':          m.value['C組']?.value          || '',
        '教員':         m.value['教員']?.value         || '',
        '単価':         m.value['単価']?.value         || '',
        '合計金額':     m.value['合計金額']?.value     || '',
    }));
};

const KUBUN_OPTIONS  = ['立替', '注文依頼', '仮払い'];
const TAISHO_OPTIONS = ['幼稚園', '小学校', '中学・高校', '事務', 'その他'];
const HIYO_OPTIONS   = ['中高 新聞委員会'];

const NEEDS_GAKUNEN = ['幼稚園', '小学校', '中学・高校'];
const GAKUNEN_REGEX = /^[0-9０-９]+年.+組$/;

const EMPTY_ROW = {
    '品名・規格No': '',
    '注文先': '',
    'A組': '',
    'B組': '',
    'C組': '',
    '教員': '',
    '単価': '',
    '合計金額': '',
};

const calcTotal = (row) => {
    const qty = ['A組', 'B組', 'C組', '教員'].reduce((sum, k) => sum + (Number(row[k]) || 0), 0);
    const tanka = Number(row['単価']) || 0;
    return qty * tanka || '';
};

const blockNonInt = (e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault();

const BuppinNewOrder = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setLoading } = useLoading();
    const { userId } = useContext(AuthContext);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const copyFrom = location.state?.copyFrom;

    const [form, setForm] = useState(
        copyFrom
            ? recordToForm(copyFrom)
            : { '区分': '', '対象': '', '学年クラス': '', '費用科目': '', '使用目的': '', '使用予定日': '', '備考': '', 'その他': '' }
    );

    const [rows, setRows] = useState(
        (copyFrom && recordToRows(copyFrom)) ?? [{ ...EMPTY_ROW }]
    );
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);

    const showGakunen = NEEDS_GAKUNEN.includes(form['対象']);
    const showSonota  = form['対象'] === 'その他';
    const gakunenError = showGakunen && form['学年クラス'] !== '' && !GAKUNEN_REGEX.test(form['学年クラス']);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const next = { ...prev, [name]: value };
            if (name === '対象') {
                next['学年クラス'] = '';
                next['その他'] = '';
            }
            return next;
        });
    };

    const handleRowChange = (index, field, value) => {
        setRows(prev => {
            const next = prev.map((r, i) => i === index ? { ...r, [field]: value } : r);
            next[index]['合計金額'] = calcTotal(next[index]);
            return next;
        });
    };

    const addRow = () => setRows(prev => [...prev, { ...EMPTY_ROW }]);

    const removeRow = (index) => {
        if (rows.length === 1) return;
        setRows(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form['区分'] || !form['対象']) {
            setError('区分・対象は必須です。');
            return;
        }
        if (showGakunen && form['学年クラス'] !== '' && !GAKUNEN_REGEX.test(form['学年クラス'])) {
            setError('学年クラスは「〇年〇組」の形式で入力してください。');
            return;
        }

        // 添付ファイルを base64 に変換
        const files = await Promise.all(
            attachments.map(file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve({
                    name: file.name,
                    mimeType: file.type || 'application/octet-stream',
                    data: e.target.result.split(',')[1], // base64 部分のみ
                });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }))
        );

        setLoading(true);
        try {
            await apiPost('workflow/saveBuppin', { form, rows, userId, files });
            setSuccess(true);
            setTimeout(() => navigate('/bupin'), 1500);
        } catch (err) {
            console.error('注文登録エラー:', err);
            setError('登録に失敗しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xl">
            <CssBaseline />
            <Box sx={{ mt: 4, mb: 8 }}>
                <PageBreadcrumbs items={[{ label: '物品注文', to: '/bupin' }, { label: '新規登録' }]} />
                <PageTitle icon={ShoppingCartIcon}>物品注文　新規登録</PageTitle>
                <Divider sx={{ mb: 3 }} />

                {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>登録しました。一覧に戻ります…</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    {/* 基本情報 */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>基本情報</Typography>
                        <Grid container spacing={3}>

                            {/* 行1: 区分・対象・学年クラス・その他 */}
                            <Grid size={12}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 3 }}>
                                        <TextField
                                            fullWidth select required label="区分"
                                            name="区分" value={form['区分']} onChange={handleFormChange}
                                        >
                                            {KUBUN_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 3 }}>
                                        <TextField
                                            fullWidth select required label="対象"
                                            name="対象" value={form['対象']} onChange={handleFormChange}
                                        >
                                            {TAISHO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                        </TextField>
                                    </Grid>
                                    {showGakunen && (
                                        <Grid size={{ xs: 12, sm: 3 }}>
                                            <TextField
                                                fullWidth label="学年クラス"
                                                name="学年クラス" value={form['学年クラス']} onChange={handleFormChange}
                                                placeholder="例：1年A組"
                                                helperText={gakunenError ? '「〇年〇組」の形式で入力してください' : '例：1年A組、2年1組'}
                                                error={gakunenError}
                                            />
                                        </Grid>
                                    )}
                                    {showSonota && (
                                        <Grid size={{ xs: 12, sm: 3 }}>
                                            <TextField
                                                fullWidth label="その他（対象の詳細を記載）"
                                                name="その他" value={form['その他']} onChange={handleFormChange}
                                            />
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>

                            {/* 行2: 使用予定日・費用科目 */}
                            <Grid size={12}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 3 }}>
                                        <TextField
                                            fullWidth type="date" label="使用予定日"
                                            name="使用予定日" value={form['使用予定日']} onChange={handleFormChange}
                                            slotProps={{ inputLabel: { shrink: true } }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 3 }}>
                                        <TextField
                                            fullWidth select label="費用科目"
                                            name="費用科目" value={form['費用科目']} onChange={handleFormChange}
                                        >
                                            <MenuItem value=""><em>（なし）</em></MenuItem>
                                            {HIYO_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* 行3: ファイル添付 */}
                            <Grid size={12}>
                                <input
                                    type="file"
                                    multiple
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                        const newFiles = Array.from(e.target.files);
                                        setAttachments(prev => {
                                            const existing = prev.map(f => f.name);
                                            return [...prev, ...newFiles.filter(f => !existing.includes(f.name))];
                                        });
                                        e.target.value = '';
                                    }}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<AttachFileIcon />}
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        領収書等のファイルを添付
                                    </Button>
                                    {attachments.map(f => (
                                        <Chip
                                            key={f.name}
                                            label={f.name}
                                            size="small"
                                            onDelete={() => setAttachments(prev => prev.filter(x => x.name !== f.name))}
                                        />
                                    ))}
                                </Box>
                            </Grid>

                            {/* 行4: 使用目的 */}
                            <Grid size={12}>
                                <TextField
                                    fullWidth multiline rows={3} label="使用目的"
                                    name="使用目的" value={form['使用目的']} onChange={handleFormChange}
                                />
                            </Grid>

                        </Grid>
                    </Paper>

                    {/* 明細 */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">明細</Typography>
                            <Button
                                variant="outlined"
                                startIcon={<AddCircleOutlineIcon />}
                                onClick={addRow}
                                size="large"
                            >
                                行を追加
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                        <TableCell sx={{ color: 'white' }}>品名・規格No</TableCell>
                                        <TableCell sx={{ color: 'white' }}>注文先</TableCell>
                                        <TableCell sx={{ color: 'white', width: 70 }} align="center">A組</TableCell>
                                        <TableCell sx={{ color: 'white', width: 70 }} align="center">B組</TableCell>
                                        <TableCell sx={{ color: 'white', width: 70 }} align="center">C組</TableCell>
                                        <TableCell sx={{ color: 'white', width: 70 }} align="center">教員</TableCell>
                                        <TableCell sx={{ color: 'white', width: 90 }} align="right">単価（¥）</TableCell>
                                        <TableCell sx={{ color: 'white', width: 100 }} align="right">合計金額</TableCell>
                                        <TableCell sx={{ color: 'white', width: 40 }} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <TextField variant="standard" fullWidth size="small"
                                                    value={row['品名・規格No']}
                                                    onChange={e => handleRowChange(i, '品名・規格No', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField variant="standard" fullWidth size="small"
                                                    value={row['注文先']}
                                                    onChange={e => handleRowChange(i, '注文先', e.target.value)}
                                                />
                                            </TableCell>
                                            {['A組', 'B組', 'C組', '教員'].map(k => (
                                                <TableCell key={k} align="center">
                                                    <TextField variant="standard" size="small" type="number"
                                                        slotProps={{ htmlInput: { min: 0, style: { textAlign: 'center' } } }}
                                                        onKeyDown={blockNonInt}
                                                        sx={{ width: 55 }}
                                                        value={row[k]}
                                                        onChange={e => handleRowChange(i, k, e.target.value)}
                                                    />
                                                </TableCell>
                                            ))}
                                            <TableCell align="right">
                                                <TextField variant="standard" size="small" type="number"
                                                    slotProps={{ htmlInput: { min: 0, style: { textAlign: 'right' } } }}
                                                    onKeyDown={blockNonInt}
                                                    sx={{ width: 80 }}
                                                    value={row['単価']}
                                                    onChange={e => handleRowChange(i, '単価', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: 'text.secondary' }}>
                                                {yen(row['合計金額'])}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="行を削除">
                                                    <span>
                                                        <IconButton size="small" onClick={() => removeRow(i)}
                                                            disabled={rows.length === 1} color="error">
                                                            <DeleteOutlineIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* 備考 */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <TextField
                            fullWidth multiline rows={3} label="備考"
                            name="備考" value={form['備考']} onChange={handleFormChange}
                        />
                    </Paper>

                    <FormActions onCancel={() => navigate('/bupin')} />
                </Box>
            </Box>
        </Container>
    );
};

export default BuppinNewOrder;
