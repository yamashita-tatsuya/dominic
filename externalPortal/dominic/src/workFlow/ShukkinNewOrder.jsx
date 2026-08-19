import { Container, CssBaseline, Box, Divider, Alert, Button } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumbs from '../components/PageBreadcrumbs';
import PageTitle from '../components/PageTitle';

const ShukkinNewOrder = () => {
    const navigate = useNavigate();

    return (
        <Container component="main" maxWidth="xl">
            <CssBaseline />
            <Box sx={{ mt: 4, mb: 8 }}>
                <PageBreadcrumbs items={[{ label: '出金申請', to: '/shukkin' }, { label: '新規申請' }]} />
                <PageTitle icon={PaymentsIcon}>出金申請　新規申請</PageTitle>
                <Divider sx={{ mb: 3 }} />
                <Alert severity="info" sx={{ mb: 3 }}>入力フォームは現在準備中です。</Alert>
                <Button variant="outlined" onClick={() => navigate('/shukkin')}>一覧に戻る</Button>
            </Box>
        </Container>
    );
};

export default ShukkinNewOrder;
