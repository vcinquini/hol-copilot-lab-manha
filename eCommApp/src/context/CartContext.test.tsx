import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { useContext } from 'react';
import { CartContext, CartProvider } from './CartContext';
import { Product } from '../types';

const productA: Product = {
  id: 'p1',
  name: 'Apple',
  price: 2.5,
  reviews: [],
  inStock: true,
  image: 'apple.jpg'
};

const productB: Product = {
  id: 'p2',
  name: 'Orange',
  price: 3.0,
  reviews: [],
  inStock: true,
  image: 'orange.jpg'
};

const CartConsumer = () => {
  const cart = useContext(CartContext);

  if (!cart) {
    return <div data-testid="missing-context">missing</div>;
  }

  return (
    <div>
      <div data-testid="count">{cart.cartItems.length}</div>
      <div data-testid="summary">
        {cart.cartItems.map(item => `${item.name}:${item.quantity}`).join('|') || 'empty'}
      </div>
      <button onClick={() => cart.addToCart(productA)}>add-a</button>
      <button onClick={() => cart.addToCart(productB)}>add-b</button>
      <button onClick={() => cart.addToCart(productA)}>add-a-again</button>
      <button onClick={() => cart.clearCart()}>clear</button>
    </div>
  );
};

describe('CartContext', () => {
  it('starts with an empty cart', () => {
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('summary')).toHaveTextContent('empty');
  });

  it('adds a product to the cart', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await user.click(screen.getByRole('button', { name: 'add-a' }));

    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('summary')).toHaveTextContent('Apple:1');
  });

  it('increments quantity when the same product is added again', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await user.click(screen.getByRole('button', { name: 'add-a' }));
    await user.click(screen.getByRole('button', { name: 'add-a-again' }));

    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('summary')).toHaveTextContent('Apple:2');
  });

  it('adds multiple products and clears the cart', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await user.click(screen.getByRole('button', { name: 'add-a' }));
    await user.click(screen.getByRole('button', { name: 'add-b' }));
    expect(screen.getByTestId('count')).toHaveTextContent('2');

    await user.click(screen.getByRole('button', { name: 'clear' }));

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('summary')).toHaveTextContent('empty');
  });

  it('returns undefined when used outside the provider', () => {
    render(<CartConsumer />);

    expect(screen.getByTestId('missing-context')).toHaveTextContent('missing');
  });
});
