import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AuthContext from './main';

const Header = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const authData = useContext(AuthContext);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNavigation = (event) => {
        const userConfirmed = window.confirm("ホーム画面に移動しますか？ 未保存の変更が失われます。");
        if (userConfirmed) {
            navigate('/home');
        } else {
            event.preventDefault();
        }
    };

    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        component="h3"
                        variant="h5"
                        sx={{
                            fontWeight: 'bold',
                            letterSpacing: 2,
                            textTransform: 'uppercase',
                            fontFamily: "'Roboto', 'Montserrat', 'Noto Sans JP', sans-serif",
                        }}
                    >
                        聖ドミニコ学園様　ポータルサイト
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    {!['/'].includes(location.pathname) && (
                        <>
                            <IconButton color="inherit" onClick={handleNavigation}>
                                <HomeIcon />
                            </IconButton>
                            <Button
                                color="inherit"
                                onClick={handleMenuOpen}
                            >
                                {authData.userName || authData.userId} さん ▽
                            </Button>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={() => {
                                    handleMenuClose();
                                    authData.setToken('');
                                    authData.setUserId('');
                                    authData.setUserName('');
                                    navigate('/');
                                }}>
                                    ログアウト
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </Toolbar>
            </AppBar>
        </div>
    );
};

export default Header;
