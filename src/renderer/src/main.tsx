import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './components/App';
import './assets/main.css';
import './index.css';
import DarkThemeProvider from './providers/DarkThemeProvider';

// eslint-disable-next-line
function Client() {
  return (
    <StrictMode>
      <BrowserRouter>
        <DarkThemeProvider>
          <App />
        </DarkThemeProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);
root.render(<Client />);
