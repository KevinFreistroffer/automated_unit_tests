
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders without crashing', () => {
    render(<Button label="test" onClick={() => {}} />);
  });
});
