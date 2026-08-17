import { useContext } from 'react';
import { Container, CssBaseline, Typography, Box, Paper, ListItemButton, ListItemText, Divider } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlightIcon from '@mui/icons-material/Flight';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useNavigate } from 'react-router-dom';
import AuthContext from './main';

const MENU_ITEMS = [
    { label: '物品注文',   sub: '物品の注文・一覧確認',   path: '/bupin',     Icon: ShoppingCartIcon },
    { label: '出張申請',   sub: '出張の申請・一覧確認',   path: '/shucchou',  Icon: FlightIcon },
    { label: '出金申請',   sub: '出金の申請・一覧確認',   path: '/shukkin',   Icon: PaymentsIcon },
    { label: '仮払申請',   sub: '仮払いの申請・一覧確認', path: '/karibarai', Icon: AccountBalanceWalletIcon },
];

const Home = () => {
    const authData = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <Container component="main" maxWidth="lg">
            <CssBaseline />
            <Box sx={{ marginTop: 4, marginBottom: 8 }}>
                <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                    ようこそ、{authData.userId} さん
                </Typography>
                <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ px: 1 }}>
                        メニュー
                    </Typography>
                    {MENU_ITEMS.map(({ label, sub, path, Icon }, i) => (
                        <Box key={path}>
                            {i > 0 && <Divider />}
                            <ListItemButton onClick={() => navigate(path)} sx={{ borderRadius: 1 }}>
                                <Icon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                                <ListItemText primary={label} secondary={sub} />
                            </ListItemButton>
                        </Box>
                    ))}
                </Paper>
            </Box>
        </Container>
    );
};

export default Home;
