import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import CheckoutModal from './CheckoutModal';
import ReviewModal from './ReviewModal';
import { calculateTotal, formatPrice, validateEmail } from '../utils/helpers';
import { Product } from '../types';

describe('CheckoutModal', () => {
  it('calls the confirm callback when checkout is continued', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(<CheckoutModal onConfirm={onConfirm} onCancel={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /are you sure/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /continue checkout/i }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls the cancel callback when returning to the cart', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<CheckoutModal onConfirm={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /return to cart/i }));

    expect(onCancel).toHaveBeenCalledOnce();
  });
});

describe('ReviewModal', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const product: Product = {
    id: 'apple',
    name: 'Apple',
    price: 1.5,
    inStock: true,
    reviews: [
      { author: 'Sam', comment: 'Crisp and fresh', date: '2025-01-15T00:00:00.000Z' }
    ]
  };

  it('renders nothing when no product is selected', () => {
    const { container } = render(
      <ReviewModal product={null} onClose={vi.fn()} onSubmit={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders existing reviews and submits a new review', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    const fixedDate = new Date('2026-09-15T12:00:00.000Z');
    vi.setSystemTime(fixedDate);

    render(<ReviewModal product={product} onClose={onClose} onSubmit={onSubmit} />);

    expect(screen.getByRole('heading', { name: /reviews for apple/i })).toBeInTheDocument();
    expect(screen.getByText('Sam')).toBeInTheDocument();
    expect(screen.getByText('Crisp and fresh')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/your name/i), 'Alex');
    await user.type(screen.getByPlaceholderText(/your review/i), 'Excellent fruit');
    await user.click(screen.getByRole('button', { name: /^submit$/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      author: 'Alex',
      comment: 'Excellent fruit',
      date: fixedDate.toISOString()
    });
    expect(screen.getByPlaceholderText(/your name/i)).toHaveValue('');
    expect(screen.getByPlaceholderText(/your review/i)).toHaveValue('');
  });

  it('renders the empty review state and closes from the modal', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const emptyProduct = { ...product, reviews: [] };

    render(<ReviewModal product={emptyProduct} onClose={onClose} onSubmit={vi.fn()} />);

    expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^close$/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('App routes', () => {
  it('renders the home route through the application shell', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/check out our products page/i)).toBeInTheDocument();
  });

  it('renders the cart route through the application shell', () => {
    render(
      <MemoryRouter initialEntries={['/cart']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });
});

describe('shopping helpers', () => {
  it('formats prices as US currency', () => {
    expect(formatPrice(12.5)).toBe('$12.50');
  });

  it('calculates the total price for cart items', () => {
    expect(calculateTotal([
      { price: 2, quantity: 3 },
      { price: 4.5, quantity: 2 }
    ])).toBe(15);
  });

  it('validates common email formats', () => {
    expect(validateEmail('shopper@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
  });
});
