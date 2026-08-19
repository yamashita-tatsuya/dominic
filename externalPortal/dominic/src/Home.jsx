import { Container, CssBaseline, Typography, Box, Card, CardActionArea } from '@mui/material';
import Grid from '@mui/material/Grid2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlightIcon from '@mui/icons-material/Flight';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useNavigate } from 'react-router-dom';

const MENU_ITEMS = [
    { label: '物品注文',   sub: '物品の注文・一覧確認',   path: '/bupin',     Icon: ShoppingCartIcon },
    { label: '出張申請',   sub: '出張の申請・一覧確認',   path: '/shucchou',  Icon: FlightIcon },
    { label: '出金申請',   sub: '出金の申請・一覧確認',   path: '/shukkin',   Icon: PaymentsIcon },
    { label: '仮払申請',   sub: '仮払いの申請・一覧確認', path: '/karibarai', Icon: AccountBalanceWalletIcon },
];

const Home = () => {
    const navigate = useNavigate();

    return (
        <Container component="main" maxWidth="lg">
            <CssBaseline />
            <Box sx={{ marginTop: 4, marginBottom: 8 }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    メニュー
                </Typography>
                <Box
                    sx={{
                        height: 2,
                        width: '100%',
                        backgroundColor: 'primary.main',
                        borderRadius: 2,
                        mb: 3,
                    }}
                />

                <Grid container spacing={3}>
                    {MENU_ITEMS.map(({ label, sub, path, Icon }) => (
                        <Grid key={path} size={{ xs: 12, sm: 6 }}>
                            <Card elevation={3} sx={{ height: '100%' }}>
                                <CardActionArea
                                    onClick={() => navigate(path)}
                                    sx={{
                                        height: '100%',
                                        p: 3,
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 2,
                                    }}
                                >
                                    <Icon sx={{ fontSize: 48, color: 'primary.main', flexShrink: 0, mr: 1 }} />
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            {label}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {sub}
                                        </Typography>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
};

export default Home;
