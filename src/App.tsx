import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Terminal from './pages/Terminal';
import Game from './pages/Game';
import Gadgets from './pages/Gadgets';

function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for GitHub Pages redirect
    const redirectPath = sessionStorage.getItem('githubPagesRedirect');
    if (redirectPath && (location.pathname === '/' || location.pathname === '/index.html')) {
      sessionStorage.removeItem('githubPagesRedirect');
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, location]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <RedirectHandler />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="projects" element={<Navigate to="/about" replace />} />
          <Route path="gadgets" element={<Gadgets />} />
          <Route path="terminal" element={<Terminal />} />
          <Route path="game" element={<Game />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
