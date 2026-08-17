import { Container, CssBaseline, Typography, Box, Divider, Alert } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';

const Shukkin = () => (
    <Container component="main" maxWidth="xl">
        <CssBaseline />
        <Box sx={{ mt: 4, mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PaymentsIcon />
                <Typography variant="h5">出金申請</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Alert severity="info">このページは現在準備中です。</Alert>
        </Box>
    </Container>
);

export default Shukkin;
