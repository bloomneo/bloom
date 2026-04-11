import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UnderConstruction from './pages/UnderConstruction';
import WebDocs from './pages/web/WebDocs';

function App() {
  return (
    <BrowserRouter basename="/helix">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/web/*" element={<WebDocs />} />
        <Route path="/desktop" element={<UnderConstruction />} />
        <Route path="/mobile" element={<UnderConstruction />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
