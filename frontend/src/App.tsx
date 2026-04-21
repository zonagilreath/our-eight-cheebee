import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { SharedList } from './components/SharedList';
import { ProductSearch } from './components/ProductSearch';
import { SyncToCart } from './components/SyncToCart';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/list" replace />} />
          <Route path="list" element={<SharedList />} />
          <Route path="search" element={<ProductSearch />} />
          <Route path="cart" element={<SyncToCart />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
