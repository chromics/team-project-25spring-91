// frontend/src/utils/useLayoutEffectFix.ts
'use client';

import React from 'react';

// Only run this on the server
if (typeof window === 'undefined') {
  // Replace useLayoutEffect with a no-op function
  React.useLayoutEffect = () => {};
}