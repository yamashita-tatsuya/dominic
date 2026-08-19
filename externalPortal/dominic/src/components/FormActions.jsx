import { Box, Button } from '@mui/material';

// 新規登録／申請ページ共通のアクセントカラー（トマトレッド）
export const ACCENT_COLOR = '#ff6347';
const ACCENT_HOVER = '#e5533d';

/**
 * 新規登録／申請ページ共通のフッターボタン（[キャンセル][登録する]）
 * @param {{
 *   onCancel: () => void,
 *   submitLabel?: string,
 *   cancelLabel?: string,
 *   disabled?: boolean,
 * }} props
 */
const FormActions = ({ onCancel, submitLabel = '登録する', cancelLabel = 'キャンセル', disabled = false }) => (
    <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
        <Button
            variant="outlined"
            size="large"
            onClick={onCancel}
            sx={{
                minWidth: 160,
                py: 1.5,
                fontSize: '1rem',
                color: ACCENT_COLOR,
                borderColor: ACCENT_COLOR,
                '&:hover': {
                    borderColor: ACCENT_HOVER,
                    backgroundColor: 'rgba(255, 99, 71, 0.08)',
                },
            }}
        >
            {cancelLabel}
        </Button>
        <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={disabled}
            sx={{
                minWidth: 160,
                py: 1.5,
                fontSize: '1rem',
                backgroundColor: ACCENT_COLOR,
                '&:hover': { backgroundColor: ACCENT_HOVER },
            }}
        >
            {submitLabel}
        </Button>
    </Box>
);

export default FormActions;
