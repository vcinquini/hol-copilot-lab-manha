import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ProductsPage from './ProductsPage';
import { CartContext } from '../context/CartContext';

vi.mock('./Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

vi.mock('./ReviewModal', () => ({
  default: ({ product, onClose, onSubmit }: { product: any; onClose: () => void; onSubmit: (review: any) => void }) => {
    if (!product) return null;

    return (
      <div data-testid="review-modal">
        <div>{product.reviews[0]?.comment ?? 'No comments yet'}</div>
        <button onClick={onClose}>Close review</button>
        <button
          onClick={() => onSubmit({ author: 'Tester', comment: 'Great product', date: '2024-01-01T00:00:00.000Z' })}
        >
          Submit review
        </button>
      </div>
    );
  }
}));

const productFiles = {
  'products/apple.json': {
    id: '1',
    name: 'Apple',
    description: 'A juicy red apple',
    price: 0.5,
    image: 'apple.png',
    category: 'fruits',
    inStock: true,
    reviews: []
  },
  'products/grapes.json': {
    name: 'Grapes',
    price: 2.5,
    category: 'fruits',
    inStock: true,
    reviews: []
  },
  'products/orange.json': {
    id: '3',
    name: 'Orange',
    description: 'A tangy orange',
    price: 0.75,
    image: 'orange.png',
    category: 'fruits',
    inStock: false,
    reviews: []
  },
  'products/pear.json': {
    id: '4',
    name: 'Pear',
    description: 'A sweet and juicy pear',
    price: 0.6,
    image: 'pear.png',
    category: 'fruits',
    inStock: true,
    reviews: []
  }
};

const renderProductsPage = (addToCart = vi.fn()) => {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string | URL | Request) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const product = productFiles[url as keyof typeof productFiles];

      if (!product) {
        return Promise.resolve({ ok: false, status: 404 } as Response);
      }

      return Promise.resolve({
        ok: true,
        json: async () => product
      } as Response);
    })
  );

  return render(
    <MemoryRouter>
      <CartContext.Provider value={{ cartItems: [], addToCart, clearCart: vi.fn() }}>
        <ProductsPage />
      </CartContext.Provider>
    </MemoryRouter>
  );
};

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the loading state before products are available', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>(() => {
            // Intentionally never resolves so the component remains in its loading state.
          })
      )
    );

    render(
      <MemoryRouter>
        <CartContext.Provider value={{ cartItems: [], addToCart: vi.fn(), clearCart: vi.fn() }}>
          <ProductsPage />
        </CartContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('loads and displays products from the product files', async () => {
    renderProductsPage();

    await waitFor(() => {
      expect(screen.getByText('Our Products')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Grapes')).toBeInTheDocument();
      expect(screen.getByText('Orange')).toBeInTheDocument();
      expect(screen.getByText('Pear')).toBeInTheDocument();
    });
  });

  it('handles a failed product request and exits the loading state', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: false, status: 500 } as Response))
    );

    render(
      <MemoryRouter>
        <CartContext.Provider value={{ cartItems: [], addToCart: vi.fn(), clearCart: vi.fn() }}>
          <ProductsPage />
        </CartContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
    });

    expect(consoleError).toHaveBeenCalledWith(
      'Error loading products:',
      expect.any(Error)
    );
  });

  it('calls addToCart when the Add to Cart button is clicked', async () => {
    const addToCart = vi.fn();
    renderProductsPage(addToCart);

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    await userEvent.click(screen.getAllByRole('button', { name: 'Add to Cart' })[0]);

    expect(addToCart).toHaveBeenCalledTimes(1);
    expect(addToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        name: 'Apple'
      })
    );
  });

  it('disables the add-to-cart button for out-of-stock products', async () => {
    renderProductsPage();

    await waitFor(() => {
      expect(screen.getByText('Orange')).toBeInTheDocument();
    });

    const orangeButton = screen.getByRole('button', { name: 'Out of Stock' });
    expect(orangeButton).toBeDisabled();
  });

  it('opens and closes the review modal and submits a review', async () => {
    const user = userEvent.setup();
    renderProductsPage();

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    await user.click(screen.getByAltText('Apple'));
    expect(screen.getByTestId('review-modal')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Submit review' }));
    await waitFor(() => {
      expect(screen.getByText('Great product')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Close review' }));
    expect(screen.queryByTestId('review-modal')).not.toBeInTheDocument();
  });

  it('throws an error when CartContext is missing', () => {
    expect(() => render(<ProductsPage />, { wrapper: MemoryRouter })).toThrow(
      'CartContext must be used within a CartProvider'
    );
  });
});
