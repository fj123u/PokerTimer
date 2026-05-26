import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { SetupPage } from './pages/SetupPage';
import { TournamentPage } from './pages/TournamentPage';
import { HistoryPage } from './pages/HistoryPage';
import { useTimer } from './hooks/useTimer';
import { useAutoSave } from './hooks/useAutoSave';

export function App() {
  useTimer();
  useAutoSave();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/tournament" element={<TournamentPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Layout>
  );
}
