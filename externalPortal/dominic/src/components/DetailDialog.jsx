import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Chip, IconButton, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { statusColor } from '../utils/status';

/**
 * 申請詳細ダイアログ（一覧の行クリックで開く／全業務共通）
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   title?: string,
 *   status?: string,
 *   info: Array<[string, React.ReactNode]>,
 *   meisai?: {
 *     columns: Array<{ header: string, align?: 'left'|'right'|'center', value: (rowValue: object) => React.ReactNode }>,
 *     rows: Array<{ value: object }>,
 *   },
 * }} props
 */
const DetailDialog = ({ open, onClose, title = '申請詳細', status, info = [], meisai }) => {
    const rows = meisai?.rows ?? [];
    const columns = meisai?.columns ?? [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {title}
                {status && (
                    <Chip label={status} color={statusColor(status)} size="small" sx={{ ml: 1 }} />
                )}
                <IconButton size="small" onClick={onClose} sx={{ ml: 'auto' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {/* 基本情報 */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mb: 2 }}>
                    {info.map(([label, val]) => (
                        <Box key={label} sx={{ minWidth: 180 }}>
                            <Typography variant="body2" color="text.secondary">{label}</Typography>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{val}</Typography>
                        </Box>
                    ))}
                </Box>

                {/* 明細テーブル */}
                {rows.length > 0 && columns.length > 0 && (
                    <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>明細</Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table sx={{ '& .MuiTableCell-root': { fontSize: '1rem', py: 1 } }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                                        {columns.map((c) => (
                                            <TableCell key={c.header} align={c.align}>{c.header}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((row, i) => (
                                        <TableRow key={i}>
                                            {columns.map((c) => (
                                                <TableCell key={c.header} align={c.align}>
                                                    {c.value(row.value)}
                                                </TableCell>
                                            ))}
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

export default DetailDialog;
