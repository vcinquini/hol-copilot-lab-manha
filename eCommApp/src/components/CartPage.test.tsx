import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CartPage from './CartPage';
import { CartContext, CartItem } from '../context/CartContext';

// Mock components
vi.mock('./Header', () => ({
    default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
    default: () => <div data-testid="footer">Footer</div>
}));

vi.mock('./CheckoutModal', () => ({
    default: ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
        <div data-testid="checkout-modal">
            <button onClick={onConfirm} data-testid="confirm-checkout">Confirm</button>
            <button onClick={onCancel} data-testid="cancel-checkout">Cancel</button>
        </div>
    )
}));

const mockCartItems: CartItem[] = [
    {
        id: '1',
        name: 'Test Product 1',
        price: 29.99,
        quantity: 2,
        image: 'test1.jpg',
        reviews: [],
        inStock: true
    },
    {
        id: '2',
        name: 'Test Product 2',
        price: 49.99,
        quantity: 1,
        image: 'test2.jpg',
        reviews: [],
        inStock: true
    }
];

const mockCartContext = {
    cartItems: mockCartItems,
    addToCart: vi.fn(),
    clearCart: vi.fn()
};

const renderWithCartContext = (cartContext = mockCartContext) => {
    return render(
        <CartContext.Provider value={cartContext}>
            <CartPage />
        </CartContext.Provider>
    );
};

describe('CartPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the empty-cart message when cartItems is empty', () => {
        renderWithCartContext({ ...mockCartContext, cartItems: [] });

        expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /checkout/i })).not.toBeInTheDocument();
    });

    it('renders the cart items and checkout button when items exist', () => {
        renderWithCartContext();

        expect(screen.getByText('Your Cart')).toBeInTheDocument();
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
        expect(screen.getByText('Price: $29.99')).toBeInTheDocument();
        expect(screen.getByText('Price: $49.99')).toBeInTheDocument();
        expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
        expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /checkout/i })).toBeInTheDocument();
    });

    it('renders the header and footer on the cart page', () => {
        renderWithCartContext();

        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('opens the checkout modal when the checkout button is clicked', async () => {
        const user = userEvent.setup();
        renderWithCartContext();

        await user.click(screen.getByRole('button', { name: /checkout/i }));

        expect(screen.getByTestId('checkout-modal')).toBeInTheDocument();
    });

    it('closes the checkout modal when checkout is cancelled', async () => {
        const user = userEvent.setup();
        renderWithCartContext();

        await user.click(screen.getByRole('button', { name: /checkout/i }));
        await user.click(screen.getByTestId('cancel-checkout'));

        expect(screen.queryByTestId('checkout-modal')).not.toBeInTheDocument();
        expect(screen.getByText('Your Cart')).toBeInTheDocument();
    });

    it('clears the cart and shows the processed order screen when checkout is confirmed', async () => {
        const user = userEvent.setup();
        const clearCart = vi.fn();
        renderWithCartContext({ ...mockCartContext, clearCart });

        await user.click(screen.getByRole('button', { name: /checkout/i }));
        await user.click(screen.getByTestId('confirm-checkout'));

        expect(clearCart).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Your order has been processed!')).toBeInTheDocument();
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
        expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
        expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
    });

    it('throws an error when CartContext is missing', () => {
        expect(() => render(<CartPage />)).toThrow('CartContext must be used within a CartProvider');
    });
});
