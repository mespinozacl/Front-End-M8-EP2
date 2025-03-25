import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// Mock de módulos y funciones
jest.mock('../../layouts/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('<Login />', () => {
  let mockContextValue: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const mockContextValue = {
      login: jest.fn(),
      authError: '',
    };

    jest.spyOn(React, 'useContext').mockReturnValue(mockContextValue);
  });

  it('should call login with admin credentials and navigate to dashboard', async () => {
    const navigateMock = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigateMock);

    render(
      <AuthContext.Provider value={mockContextValue}>
        <Login />
      </AuthContext.Provider>
    );

    const usernameInput = screen.getByLabelText('Usuario:');
    const passwordInput = screen.getByLabelText('Contraseña:');
    const loginButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      /*
      expect(mockContextValue.login).toHaveBeenCalledWith(expect.objectContaining({
        username: "admin",
        role: "admin"
      }));
      */
      expect(navigateMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should call login with user credentials and navigate to home', async () => {
    const navigateMock = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigateMock);

    render(
      <AuthContext.Provider value={mockContextValue}>
        <Login />
      </AuthContext.Provider>
    );

    const usernameInput = screen.getByLabelText('Usuario:');
    const passwordInput = screen.getByLabelText('Contraseña:');
    const loginButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(usernameInput, { target: { value: 'user' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('should display error message for incorrect credentials', async () => {
    render(
      <AuthContext.Provider value={mockContextValue}>
        <Login />
      </AuthContext.Provider>
    );

    const usernameInput = screen.getByLabelText('Usuario:');
    const passwordInput = screen.getByLabelText('Contraseña:');
    const loginButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText("Credenciales incorrectas")).toBeInTheDocument;
    });
  });

});