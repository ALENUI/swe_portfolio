import { renderToString } from 'react-dom/server';
import App from './app/App';
import NotFound from './app/NotFound';

export { profile } from './app/data/profile';
export { content, validateContent } from './app/data/content';

export function render(page: 'home' | '404' = 'home') {
  return renderToString(page === '404' ? <NotFound /> : <App />);
}
