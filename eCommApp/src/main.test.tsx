import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('main entry point', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('creates the root and renders the application', async () => {
    const render = vi.fn();
    const createRoot = vi.fn(() => ({ render }));

    vi.doMock('react-dom/client', () => ({
      default: { createRoot }
    }));
    vi.doMock('./App.tsx', () => ({
      default: () => <div data-testid="mock-app">App</div>
    }));

    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    await import('./main.tsx');

    expect(createRoot).toHaveBeenCalledOnce();
    expect(createRoot).toHaveBeenCalledWith(root);
    expect(render).toHaveBeenCalledOnce();

    const renderedElement = render.mock.calls[0][0] as React.ReactElement;
    expect(renderedElement.type).toBe(React.StrictMode);
    expect(renderedElement.props.children.type).toBeDefined();
    expect(renderedElement.props.children.props.children.type).toBeDefined();
  });
});
