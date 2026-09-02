import { describe, expect, it } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import Home from './page';

describe('page d’accueil', () => {
  it('rend un contenu principal et un titre', () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain('<main');
    expect(html).toContain('<h1');
  });
});
