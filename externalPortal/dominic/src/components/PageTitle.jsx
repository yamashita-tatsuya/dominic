import { Box, Typography } from '@mui/material';

/**
 * アイコン付きページタイトル（一覧／新規ページ共通）
 * @param {{ icon: React.ElementType, children: React.ReactNode, sx?: object }} props
 *   icon 例: ShoppingCartIcon
 */
const PageTitle = ({ icon: Icon, children, sx }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, ...sx }}>
        {Icon && <Icon />}
        <Typography variant="h5">{children}</Typography>
    </Box>
);

export default PageTitle;
