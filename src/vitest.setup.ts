import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
    cleanup();
});

const originalConsoleError = console.error;
console.error = (...args) => {
    if (
        typeof args[0] === 'string' &&
        args[0].includes('Received `%s` for a non-boolean attribute `%s`')
    ) {
        return;
    }
    if (
        typeof args[0] === 'string' &&
        args[0].includes('styled-components: it looks like an unknown prop "center" is being sent through to the DOM')
    ) {
        return;
    }
    originalConsoleError(...args);
};
