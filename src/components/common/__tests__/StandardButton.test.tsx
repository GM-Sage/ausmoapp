import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StandardButton from '../StandardButton';

describe('StandardButton', () => {
  const defaultProps = {
    title: 'Test Button',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with title', () => {
    const { getByText } = render(<StandardButton {...defaultProps} />);

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const { getByText } = render(<StandardButton {...defaultProps} />);

    fireEvent.press(getByText('Test Button'));

    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByText } = render(
      <StandardButton {...defaultProps} style={customStyle} />
    );

    const button = getByText('Test Button');
    expect(button.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining(customStyle)])
    );
  });

  it('should show loading state when loading', () => {
    const { getByText } = render(
      <StandardButton {...defaultProps} loading={true} />
    );

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('should be disabled when disabled prop is true', () => {
    const { getByText } = render(
      <StandardButton {...defaultProps} disabled={true} />
    );

    const button = getByText('Test Button');

    fireEvent.press(button);

    expect(defaultProps.onPress).not.toHaveBeenCalled();
  });

  it('should not call onPress when loading', () => {
    const { getByText } = render(
      <StandardButton {...defaultProps} loading={true} />
    );

    fireEvent.press(getByText('Loading...'));

    expect(defaultProps.onPress).not.toHaveBeenCalled();
  });

  it('should render with different variants', () => {
    const { getByText, rerender } = render(
      <StandardButton {...defaultProps} variant="secondary" />
    );

    expect(getByText('Test Button')).toBeTruthy();

    rerender(<StandardButton {...defaultProps} variant="outline" />);

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should render with custom icon', () => {
    const { getByTestId } = render(
      <StandardButton
        {...defaultProps}
        icon="heart"
        testID="button-with-icon"
      />
    );

    expect(getByTestId('button-with-icon')).toBeTruthy();
  });

  it('should handle long press', () => {
    const onLongPress = jest.fn();
    const { getByText } = render(
      <StandardButton {...defaultProps} onLongPress={onLongPress} />
    );

    fireEvent(getByText('Test Button'), 'longPress');

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('should be accessible', () => {
    const { getByText } = render(
      <StandardButton
        {...defaultProps}
        accessibilityLabel="Custom accessibility label"
      />
    );

    const button = getByText('Test Button');
    expect(button.props.accessibilityLabel).toBe('Custom accessibility label');
  });

  it('should render with correct size', () => {
    const { getByText } = render(
      <StandardButton {...defaultProps} size="large" />
    );

    const button = getByText('Test Button');
    expect(button).toBeTruthy();
  });
});
