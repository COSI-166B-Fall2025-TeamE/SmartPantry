import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import Scan from '../../app/scan';

// mocks
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  Stack: {
    Screen: ({ children }: any) => children,
  },
}));

jest.mock('@expo/vector-icons/build/Ionicons', () => 'Ionicons');
jest.mock('expo-camera', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return {
    CameraView: ({ onBarcodeScanned }: any) => {
      return React.createElement(
        TouchableOpacity,
        {
          testID: 'mock-camera',
          onPress: () => onBarcodeScanned({ data: '123456789' }),
        },
        React.createElement(Text, null, 'MockCamera')
      );
    },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock('../../app/overlay', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View, { testID: 'overlay' });
});

global.fetch = jest.fn();
const alertSpy = jest.spyOn(Alert, 'alert');

describe('Scan component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders camera and overlay', () => {
    const { getByTestId } = render(<Scan />);
    expect(getByTestId('mock-camera')).toBeTruthy();
    expect(getByTestId('overlay')).toBeTruthy();
  });


  it('handles successful product scan', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: 1,
        product: { product_name: 'Test Product' },
      }),
    });

    const { getByTestId } = render(<Scan />);
    const mockCamera = getByTestId('mock-camera');
    fireEvent.press(mockCamera);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Product Found!',
        'Test Product',
        expect.any(Array)
      );
    });
  });

  it('handles product not found case', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ status: 0 }),
    });

    const { getByTestId } = render(<Scan />);
    fireEvent.press(getByTestId('mock-camera'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Product Not Found',
        expect.any(String),
        expect.any(Array)
      );
    });
  });

  it('prevents duplicate scans', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        status: 1,
        product: { product_name: 'Test' },
      }),
    });

    const { getByTestId } = render(<Scan />);
    const camera = getByTestId('mock-camera');
    
    // presing twice quickly
    fireEvent.press(camera);
    fireEvent.press(camera);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});