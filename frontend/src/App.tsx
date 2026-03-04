import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Readers from './pages/Readers';
import Borrows from './pages/Borrows';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="books" element={<Books />} />
        <Route path="readers" element={<Readers />} />
        <Route path="borrows" element={<Borrows />} />
      </Route>
    </Routes>
  );
}

export default App;
