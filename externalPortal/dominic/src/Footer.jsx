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
                お問い合わせはゆびすいまでご連絡ください。
            </div>
        </footer>
    );
};

export default Footer;
