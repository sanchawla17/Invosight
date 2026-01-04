// Polyfill TextEncoder/TextDecoder for JSDOM + React Router
import { TextEncoder, TextDecoder } from 'util';

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}
if (!global.TextDecoder) {
  // utf-8 default like in browsers
  global.TextDecoder = TextDecoder;
}

import '@testing-library/jest-dom';
