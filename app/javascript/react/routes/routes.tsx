import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../components/home/Home';
import Transcriptions from '../components/transcription/Transcriptions';
import TranscriptionShow from '../components/transcription/transcriptionShow/TranscriptionShow';
import { loader as transcriptionLoader } from '../components/transcription/transcriptionShow/TranscriptionShow';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Public routes
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <Signup /> },

      // Protected routes
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/home', element: <Home /> },
          { path: '/transcriptions', element: <Transcriptions /> },
          {
            path: 'transcriptions/:id',
            element: <TranscriptionShow />,
            loader: transcriptionLoader,
          },
        ],
      },
    ],
  },
]);
