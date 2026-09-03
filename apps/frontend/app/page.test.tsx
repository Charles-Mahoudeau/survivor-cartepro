import { describe, expect, it } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import Home from './page';

describe('home page', () => {
  it('renders a main landmark and a heading', () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain('<main');
    expect(html).toContain('<h1');
  });
});
