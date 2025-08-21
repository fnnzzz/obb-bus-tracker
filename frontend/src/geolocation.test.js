import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn()
};

describe('Geolocation-based tab selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default navigator mock
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true
    });
  });

  test('defaults to "From Home" when geolocation is not available', async () => {
    // Mock geolocation as not available
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true,
      configurable: true
    });

    render(<App />);
    
    await waitFor(() => {
      const fromHomeTab = screen.getByText('From Home');
      expect(fromHomeTab).toHaveClass('bg-white', 'text-gray-900');
    });
  });

  test('defaults to "From Home" when user is close to home (<1km)', async () => {
    // Mock geolocation to return coordinates close to home
    // Home coordinates: 48.1322819, 16.2630222
    // Using coordinates ~500m away
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success({
        coords: {
          latitude: 48.1368, // ~500m away from home
          longitude: 16.2630
        }
      });
    });

    render(<App />);
    
    await waitFor(() => {
      const fromHomeTab = screen.getByText('From Home');
      expect(fromHomeTab).toHaveClass('bg-white', 'text-gray-900');
    });
  });

  test('sets "To Home" when user is far from home (>1km)', async () => {
    // Mock geolocation to return coordinates far from home
    // Using coordinates ~2km away from home
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success({
        coords: {
          latitude: 48.1500, // ~2km away from home
          longitude: 16.2800
        }
      });
    });

    render(<App />);
    
    await waitFor(() => {
      const toHomeTab = screen.getByText('To Home');
      expect(toHomeTab).toHaveClass('bg-white', 'text-gray-900');
    });
  });

  test('defaults to "From Home" when geolocation permission is denied', async () => {
    // Mock geolocation permission denial
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
      error(new Error('Permission denied'));
    });

    render(<App />);
    
    await waitFor(() => {
      const fromHomeTab = screen.getByText('From Home');
      expect(fromHomeTab).toHaveClass('bg-white', 'text-gray-900');
    });
  });
});