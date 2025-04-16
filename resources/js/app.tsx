import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { type ErrorBag, type Errors, type GlobalEvent } from '@inertiajs/core';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import Swal from 'sweetalert2';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

interface FlashMessages {
    success?: string;
    error?: string;
}

interface InertiaProps extends Record<string, unknown> {
    flash?: FlashMessages;
    errors: Errors & ErrorBag;
    deferred?: Record<string, string[] | undefined>;
}

router.on('success', (event: GlobalEvent<'success'>) => {
    const flash = event.detail.page.props.flash as FlashMessages | undefined;
    if (flash?.success) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: flash.success,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    }
    if (flash?.error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: flash.error,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
        });
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
