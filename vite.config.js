// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { meteor } from 'meteor-vite/plugin';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
    plugins: [
        meteor({
            clientEntry: './ui/main.jsx',
            externalizeNpmPackages: ['react', 'react-dom'],
            stubValidation: {
                ignoreDuplicateExportsInPackages: ['react', 'react-dom'],
            },
        }),
        react({
            jsxRuntime: 'classic',
        }),
    ],
});
