import ReactDOMServer from 'react-dom/server';
import App from './App';

export function renderProjectsToHTML(): string {
  return ReactDOMServer.renderToString(<App />);
}
