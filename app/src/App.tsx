import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TerritorySlicerPage from './pages/TerritorySlicerPage';
import TerritoryComparisonPage from './pages/TerritoryComparisonPage';
import TerritoryAuditPage from './pages/TerritoryAuditPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate to="/slicer" replace />} />
        <Route path="/slicer" element={<TerritorySlicerPage />} />
        <Route path="/comparison" element={<TerritoryComparisonPage />} />
        <Route path="/audit" element={<TerritoryAuditPage />} />
        <Route path="*" element={<Navigate to="/slicer" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
