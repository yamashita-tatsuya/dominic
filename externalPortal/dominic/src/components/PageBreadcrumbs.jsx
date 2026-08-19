import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { Link as RouterLink } from 'react-router-dom';

/**
 * ページ階層を示す共通パンくずリスト
 * 先頭に自動でホーム（/home）を付与し、最後の要素は現在地として非リンク表示する。
 *
 * @param {{ items: Array<{ label: string, to?: string }> }} props
 *   items 例: [{ label: '物品注文', to: '/bupin' }, { label: '新規登録' }]
 */
const PageBreadcrumbs = ({ items = [] }) => (
    <Breadcrumbs
        separator={<NavigateNextIcon sx={{ fontSize: 16 }} />}
        sx={{ mb: 2, fontSize: '0.8rem' }}
        aria-label="パンくずリスト"
    >
        <Link
            component={RouterLink}
            to="/home"
            underline="hover"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
        >
            <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
            ホーム
        </Link>

        {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return isLast || !item.to ? (
                <Typography key={item.label} color="text.primary" sx={{ fontSize: 'inherit' }}>
                    {item.label}
                </Typography>
            ) : (
                <Link
                    key={item.label}
                    component={RouterLink}
                    to={item.to}
                    underline="hover"
                    color="inherit"
                >
                    {item.label}
                </Link>
            );
        })}
    </Breadcrumbs>
);

export default PageBreadcrumbs;
