import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main tabs', () => {
  render(<App />);
  const fromHomeTab = screen.getByText(/From Home/i);
  const toHomeTab = screen.getByText(/To Home/i);
  expect(fromHomeTab).toBeInTheDocument();
  expect(toHomeTab).toBeInTheDocument();
});
