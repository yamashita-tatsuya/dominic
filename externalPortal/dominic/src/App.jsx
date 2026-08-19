import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingProvider } from './contexts/LoadingContext.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import LoginForm from './auth/LoginForm.jsx';
import RequireAuth from './auth/RequireAuth.jsx';
import Home from './Home.jsx';
import BuppinOrder from './workFlow/BuppinOrder.jsx';
import BuppinNewOrder from './workFlow/BuppinNewOrder.jsx';
import Shucchou from './workFlow/Shucchou.jsx';
import ShucchouNewOrder from './workFlow/ShucchouNewOrder.jsx';
import Shukkin from './workFlow/Shukkin.jsx';
import ShukkinNewOrder from './workFlow/ShukkinNewOrder.jsx';
import Karibarai from './workFlow/Karibarai.jsx';
import KaribaraiNewOrder from './workFlow/KaribaraiNewOrder.jsx';
import './App.css';

function App() {
  return (
    <LoadingProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <div style={{ flex: 1 }}>
            <Routes>
              {/* 公開ルート */}
              <Route path="/" element={<LoginForm />} />
              {/* 認証済みルート */}
              <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
              <Route path="/bupin" element={<RequireAuth><BuppinOrder /></RequireAuth>} />
              <Route path="/bupin/new" element={<RequireAuth><BuppinNewOrder /></RequireAuth>} />
              <Route path="/shucchou" element={<RequireAuth><Shucchou /></RequireAuth>} />
              <Route path="/shucchou/new" element={<RequireAuth><ShucchouNewOrder /></RequireAuth>} />
              <Route path="/shukkin" element={<RequireAuth><Shukkin /></RequireAuth>} />
              <Route path="/shukkin/new" element={<RequireAuth><ShukkinNewOrder /></RequireAuth>} />
              <Route path="/karibarai" element={<RequireAuth><Karibarai /></RequireAuth>} />
              <Route path="/karibarai/new" element={<RequireAuth><KaribaraiNewOrder /></RequireAuth>} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </LoadingProvider>
  );
}

export default App;
