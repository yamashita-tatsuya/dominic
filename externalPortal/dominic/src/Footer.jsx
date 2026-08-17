import React from 'react';

const Footer = () => {
    const footerContentStyle = {
        backgroundColor: '#f5f5f5',
        textAlign: 'center',
        borderTop: '1px solid #ddd',
        fontSize: '14px',
        color: '#555',
        padding: '16px',
    };

    return (
        <footer>
            <div style={footerContentStyle}>
                お問い合わせは〇〇まで、お電話ください。
            </div>
        </footer>
    );
};

export default Footer;
