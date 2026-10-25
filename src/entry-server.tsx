import { renderToString } from 'react-dom/server';
import App from './app/App';

export { profile } from './app/data/profile';

export function render() {
  return renderToString(<App />);
}
