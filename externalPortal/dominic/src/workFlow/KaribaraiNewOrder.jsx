import { Container, CssBaseline, Box, Divider, Alert, Button } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumbs from '../components/PageBreadcrumbs';
import PageTitle from '../components/PageTitle';

const KaribaraiNewOrder = () => {
    const navigate = useNavigate();

    return (
        <Container component="main" maxWidth="xl">
            <CssBaseline />
            <Box sx={{ mt: 4, mb: 8 }}>
                <PageBreadcrumbs items={[{ label: '仮払申請', to: '/karibarai' }, { label: '新規申請' }]} />
                <PageTitle icon={AccountBalanceWalletIcon}>仮払申請　新規申請</PageTitle>
                <Divider sx={{ mb: 3 }} />
                <Alert severity="info" sx={{ mb: 3 }}>入力フォームは現在準備中です。</Alert>
                <Button variant="outlined" onClick={() => navigate('/karibarai')}>一覧に戻る</Button>
            </Box>
        </Container>
    );
};

export default KaribaraiNewOrder;
