import { useState, useContext } from 'react';
import {
    Box, Button, TextField, Typography, Container, CssBaseline,
    Alert, CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AuthContext from '../main';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiPost } from '../https/useApiConnect';

function LoginForm() {
    const authData = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from ?? { pathname: '/home' };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState({ id: '', password: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!data.id || !data.password) {
            setError('IDとパスワードを入力してください。');
            return;
        }

        setLoading(true);
        try {
            const response = await apiPost('auth/login', { id: data.id, password: data.password });
            if (!response) {
                setError('IDまたはパスワードが正しくありません。');
                return;
            }
            authData.setToken(response.token);
            authData.setUserId(response.user.id);
            authData.setUserName(response.user.name);
            navigate(from, { replace: true });
        } catch (err) {
            console.error('Login failed:', err);
            setError('IDまたはパスワードが正しくありません。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                    }}
                >
                    <LockOutlinedIcon sx={{ fontSize: 28 }} />
                    <Typography component="h1" variant="h5">
                        ログイン
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ width: '100%', mt: 1 }}>
                        {error}
                    </Alert>
                )}

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    autoComplete="on"
                    sx={{ mt: 1, width: '100%' }}
                >
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="id"
                        label="ID"
                        autoFocus
                        autoComplete="username"
                        value={data.id}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="パスワード"
                        type="password"
                        autoComplete="current-password"
                        value={data.password}
                        onChange={handleChange}
                    />
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            ログイン
                        </Button>
                    )}
                </Box>
            </Box>
        </Container>
    );
}

export default LoginForm;
