import React from 'react';

import { createRoot } from 'react-dom/client';

import { ConnectManager } from './ConnectManager';

const container = document.getElementById('connect-manager-container');
const root = createRoot(container!);
root.render(<ConnectManager />);
