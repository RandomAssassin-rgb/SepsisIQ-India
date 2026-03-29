import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PatientInput from './components/PatientInput';
import Inference from './components/Inference';
import Results from './components/Results';
import History from './components/History';
import Research from './components/Research';
import Settings from './components/Settings';
import PatientTrajectory from './components/PatientTrajectory';
import StewardshipDashboard from './components/StewardshipDashboard';
import OnCallView from './components/OnCallView';
import WardView from './components/WardView';
import Alerts from './components/Alerts';
import InquiryForm from './components/InquiryForm';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/input" element={<PatientInput />} />
          <Route path="/inference" element={<Inference />} />
          <Route path="/results" element={<Results />} />
          <Route path="/history" element={<History />} />
          <Route path="/research" element={<Research />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/trajectory" element={<PatientTrajectory />} />
          <Route path="/stewardship" element={<StewardshipDashboard />} />
          <Route path="/ward" element={<WardView />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/oncall" element={<OnCallView />} />
          <Route path="/inquiry" element={<InquiryForm />} />
        </Route>
      </Routes>
    </Router>
  );
}
