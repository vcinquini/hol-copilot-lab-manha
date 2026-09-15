import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Header from './Header';
import Footer from './Footer';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import AdminPage from './AdminPage';

describe('Main app pages', () => {
  it('renders the header navigation links', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /the daily harvest/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /products/i })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: /cart/i })).toHaveAttribute('href', '/cart');
    expect(screen.getByRole('button', { name: /admin login/i })).toBeInTheDocument();
  });

  it('renders the footer content', () => {
    render(<Footer />);

    expect(screen.getByText(/© 2025 The Daily Harvest/i)).toBeInTheDocument();
  });

  it('renders the homepage welcome message and shared layout', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/welcome to the the daily harvest!/i)).toBeInTheDocument();
    expect(screen.getByText(/check out our products page for some great deals/i)).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /the daily harvest/i }).length).toBeGreaterThan(0);
  });

  it('allows an admin user to log in and navigate to the admin page', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<div>Admin page loaded</div>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText(/username/i), 'admin');
    await user.type(screen.getByPlaceholderText(/password/i), 'admin');
    await user.click(screen.getByRole('button', { name: /^Login$/i }));

    expect(screen.getByText(/admin page loaded/i)).toBeInTheDocument();
  });

  it('shows an error when the admin login credentials are invalid', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<div>Admin page loaded</div>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText(/username/i), 'wrong');
    await user.type(screen.getByPlaceholderText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /^Login$/i }));

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('updates the sale percent and supports ending a sale in the admin page', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    const input = screen.getByLabelText(/set sale percent/i);
    await user.clear(input);
    await user.type(input, '25');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByText(/all products are 25% off!/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /end sale/i }));
    expect(screen.getByText(/no sale active/i)).toBeInTheDocument();
  });

  it('shows an error message for invalid admin sale input', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    const input = screen.getByLabelText(/set sale percent/i);
    await user.clear(input);
    await user.type(input, 'abc');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByText(/invalid input/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter a valid number/i)).toBeInTheDocument();
  });
});
