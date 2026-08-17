import { createContext, useState, useContext, useCallback } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';

const LoadingContext = createContext({
    loading: false,
    setLoading: () => {},
});

export const LoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {children}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 999 }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);
