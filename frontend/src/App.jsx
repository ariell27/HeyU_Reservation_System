import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import BookingPage from './pages/BookingPage';
import TimeSelectionPage from './pages/TimeSelectionPage';
import CustomerInfoPage from './pages/CustomerInfoPage';
import SuccessPage from './pages/SuccessPage';
import AdminPage from './pages/AdminPage';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking/time" element={<TimeSelectionPage />} />
        <Route path="/booking/confirm" element={<CustomerInfoPage />} />
        <Route path="/booking/success" element={<SuccessPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
