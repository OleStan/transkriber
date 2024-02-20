import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../components/home/Home";
import Transcriptions from "../components/transcription/Transcriptions";
import TranscriptionShow from "../components/transcription/transcriptionShow/TranscriptionShow";
import { loader as transcriptionLoader } from "../components/transcription/transcriptionShow/TranscriptionShow";
import Root from "./Root";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Root /> },
      { path: "/home", element: <Home /> },
      { path: "/transcriptions", element: <Transcriptions /> },
      {
        path: "transcriptions/:id",
        element: <TranscriptionShow />,
        loader: transcriptionLoader,
      },
    ],
  },
]);
