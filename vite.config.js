// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import stripCode from 'rollup-plugin-strip-code';
import { meteor } from 'meteor-vite/plugin';

const isDevelopment = process.env.npm_lifecycle_script?.includes('mode=development');
const enableBundleVisualizer = process.env.ENABLE_BUNDLE_VISUALIZER === 'true';

const developmentVsProductionDefineConfig = isDevelopment ? {
    'Meteor.isDevelopment': JSON.stringify(true),
    'Meteor.isProduction': JSON.stringify(false),
} : {
    'Meteor.isDevelopment': JSON.stringify(false),
    'Meteor.isProduction': JSON.stringify(true),
};

function excludeBlockStrip(excludeConfig) {
    return excludeConfig?.exclude
        ? {
            ...stripCode({
                start_comment: `${excludeConfig.exclude}:start`,
                end_comment: `${excludeConfig.exclude}:end`,
            }),
            enforce: 'pre',
            apply: 'build',
        }
        : undefined;
}

const excludeBlockStripByMode = isDevelopment
    ? excludeBlockStrip({ exclude: 'production' })
    : excludeBlockStrip({ exclude: 'development' });

const clientCommonConfig = {
    build: {
        outDir: 'client',
        emptyOutDir: false,
        target: 'modules',
        rollupOptions: {
            input: {
                main: './ui/main.jsx',
            },
            output: {
                entryFileNames: 'client.js',
            },
            plugins: [
                enableBundleVisualizer && visualizer({ open: true, filename: 'public/stats.html' }),
            ].filter(Boolean),
        },
        minify: false,
    },
    define: {
        'Meteor.isClient': JSON.stringify(true),
        'Meteor.isServer': JSON.stringify(false),
        'Meteor.isTest': JSON.stringify(false),
        ...developmentVsProductionDefineConfig,
    },
    plugins: [
        meteor({
            clientEntry: 'ui/main.jsx',
            stubValidation: {
                ignoreDuplicateExportsInPackages: ['react', 'react-dom'],
                warnOnly: true,
                disabled: false,
            },
        }),
        react({
            jsxRuntime: 'classic',
        }),
        excludeBlockStrip({ exclude: 'server' }),
        excludeBlockStripByMode,
    ],
};

const clientDevelopmentConfig = {
    ...clientCommonConfig,
};

const clientProductionConfig = {
    ...clientCommonConfig,
    build: {
        ...clientCommonConfig.build,
        minify: true,
    },
};

// eslint-disable-next-line import/no-default-export
export default defineConfig(({ mode }) => {
    switch (mode) {
        case 'development':
            return clientDevelopmentConfig;
        case 'production':
            return clientProductionConfig;
        default:
            return clientProductionConfig;
    }
});
