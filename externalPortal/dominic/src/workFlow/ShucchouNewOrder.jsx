import { useState, useContext } from 'react';
import {
    Container, CssBaseline, Typography, Box, Paper, Divider,
    TextField, MenuItem, Button, IconButton, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Alert,
    RadioGroup, FormControlLabel, Radio, FormLabel, Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FlightIcon from '@mui/icons-material/Flight';
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
    '区分':     r['区分']?.value     || '',
    '用務':     r['用務']?.value     || '',
    '出張先':   r['出張先']?.value   || '',
    '出発日':   r['出発日']?.value   || '',
    '出発時刻': r['出発時刻']?.value || '',
    '帰宅日':   r['帰宅日']?.value   || '',
    '帰宅時刻': r['帰宅時刻']?.value || '',
    '発令日':   r['発令日']?.value   || '',
    '食事支給': r['食事支給']?.value || '無',
    '備考':     r['備考']?.value     || '',
});

const recordToRows = (r) => {
    const meisai = r['明細']?.value;
    if (!meisai?.length) return null;
    return meisai.map(m => ({
        '科目': m.value['科目']?.value || '',
        '金額': m.value['金額']?.value || '',
        '摘要': m.value['摘要']?.value || '',
    }));
};

const KUBUN_OPTIONS   = ['校務', '引率', 'その他'];
const KAMOKU_OPTIONS  = ['交通費', '宿泊費', '日当', '会費', 'その他'];

const EMPTY_ROW = { '科目': '', '金額': '', '摘要': '' };

const EMPTY_FORM = {
    '区分': '', '用務': '', '出張先': '',
    '出発日': '', '出発時刻': '', '帰宅日': '', '帰宅時刻': '',
    '発令日': '', '食事支給': '無', '備考': '',
};

const blockNonInt = (e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault();

const ShucchouNewOrder = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setLoading } = useLoading();
    const { userId } = useContext(AuthContext);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const copyFrom = location.state?.copyFrom;

    const [form, setForm] = useState(copyFrom ? recordToForm(copyFrom) : { ...EMPTY_FORM });
    const [rows, setRows] = useState((copyFrom && recordToRows(copyFrom)) ?? [{ ...EMPTY_ROW }]);

    const ryohiGoukei = rows.reduce((sum, row) => sum + (Number(row['金額']) || 0), 0);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleRowChange = (index, field, value) => {
        setRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
    };

    const addRow = () => setRows(prev => [...prev, { ...EMPTY_ROW }]);

    const removeRow = (index) => {
        if (rows.length === 1) return;
        setRows(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form['区分'] || !form['出張先']) {
            setError('区分・出張先は必須です。');
            return;
        }

        setLoading(true);
        try {
            await apiPost('workflow/saveShucchou', { form, rows, userId });
            setSuccess(true);
            setTimeout(() => navigate('/shucchou'), 1500);
        } catch (err) {
            console.error('出張申請登録エラー:', err);
            setError('登録に失敗しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xl">
            <CssBaseline />
            <Box sx={{ mt: 4, mb: 8 }}>
                <PageBreadcrumbs items={[{ label: '出張申請', to: '/shucchou' }, { label: '新規申請' }]} />
                <PageTitle icon={FlightIcon}>出張申請　新規申請</PageTitle>
                <Divider sx={{ mb: 3 }} />

                {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>登録しました。一覧に戻ります…</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    {/* 基本情報 */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>基本情報</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 3 }}>
                                <TextField
                                    fullWidth select required label="区分"
                                    name="区分" value={form['区分']} onChange={handleFormChange}
                                >
                                    {KUBUN_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 9 }}>
                                <TextField
                                    fullWidth required label="出張先"
                                    name="出張先" value={form['出張先']} onChange={handleFormChange}
                                />
                            </Grid>

                            <Grid size={12}>
                                <TextField
                                    fullWidth label="用務"
                                    name="用務" value={form['用務']} onChange={handleFormChange}
                                />
                            </Grid>

                            {/* 出発 */}
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <TextField
                                    fullWidth type="date" label="出発日"
                                    name="出発日" value={form['出発日']} onChange={handleFormChange}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <TextField
                                    fullWidth type="time" label="出発時刻"
                                    name="出発時刻" value={form['出発時刻']} onChange={handleFormChange}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            </Grid>
                            {/* 帰宅 */}
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <TextField
                                    fullWidth type="date" label="帰宅・帰校日"
                                    name="帰宅日" value={form['帰宅日']} onChange={handleFormChange}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <TextField
                                    fullWidth type="time" label="帰宅・帰校時刻"
                                    name="帰宅時刻" value={form['帰宅時刻']} onChange={handleFormChange}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            </Grid>

                            {/* 発令日・食事支給 */}
                            <Grid size={{ xs: 12, sm: 3 }}>
                                <TextField
                                    fullWidth type="date" label="発令日"
                                    name="発令日" value={form['発令日']} onChange={handleFormChange}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 9 }}>
                                <FormLabel sx={{ fontSize: '0.75rem' }}>食事支給</FormLabel>
                                <RadioGroup
                                    row name="食事支給" value={form['食事支給']} onChange={handleFormChange}
                                >
                                    <FormControlLabel value="無" control={<Radio />} label="無" />
                                    <FormControlLabel value="有" control={<Radio />} label="有" />
                                </RadioGroup>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* 明細 */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">明細（旅費）</Typography>
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
                                        <TableCell sx={{ color: 'white', width: 160 }}>科目</TableCell>
                                        <TableCell sx={{ color: 'white', width: 120 }} align="right">金額（¥）</TableCell>
                                        <TableCell sx={{ color: 'white' }}>摘要</TableCell>
                                        <TableCell sx={{ color: 'white', width: 40 }} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <TextField variant="standard" select fullWidth size="small"
                                                    value={row['科目']}
                                                    onChange={e => handleRowChange(i, '科目', e.target.value)}
                                                >
                                                    {KAMOKU_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                                </TextField>
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField variant="standard" size="small" type="number"
                                                    slotProps={{ htmlInput: { min: 0, style: { textAlign: 'right' } } }}
                                                    onKeyDown={blockNonInt}
                                                    sx={{ width: 100 }}
                                                    value={row['金額']}
                                                    onChange={e => handleRowChange(i, '金額', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField variant="standard" fullWidth size="small"
                                                    value={row['摘要']}
                                                    onChange={e => handleRowChange(i, '摘要', e.target.value)}
                                                />
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
                                    <TableRow>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>旅費合計</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                            {yen(ryohiGoukei)}
                                        </TableCell>
                                        <TableCell colSpan={2} />
                                    </TableRow>
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

                    <FormActions onCancel={() => navigate('/shucchou')} />
                </Box>
            </Box>
        </Container>
    );
};

export default ShucchouNewOrder;
