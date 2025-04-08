import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import FormPage from './pages/FormPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form/:action" element={<FormPage />} />
        <Route path="/chat/:roomId" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
