import Swal from 'sweetalert2';

/**
 * Common alert helper.
 *
 * Improvements:
 * - Accept `position` and `timer` via `opts`.
 * - Default behavior: no timer (user must dismiss or click confirm).
 * - If `toast: true` or `timer` is provided, we render as toast. If no timer provided, toast won't auto-close.
 */
type AlertOpts = {
    // SweetAlert2 exposes a `position` string (e.g. 'top-end'). Avoid referencing
    // non-exported namespace members on the default import to keep typings stable.
    position?: string;
    timer?: number | null; // null/undefined = no auto-close
    toast?: boolean;
    // allow any other SweetAlert2 options
    [key: string]: any;
};

function buildConfig(icon: 'success' | 'error' | 'warning' | 'info', title: string, text?: string, opts: AlertOpts = {}) {
    const cfg: any = {
        icon,
        title,
        text,
        ...opts,
    };

    // If developer provided explicit position, pass it through
    if (opts.position) cfg.position = opts.position;

    // If timer is a number > 0, set timer and render as toast by default
    if (typeof opts.timer === 'number' && opts.timer > 0) {
        cfg.timer = opts.timer;
        // for timers, prefer toast rendering so it behaves like a transient notification
        cfg.toast = opts.toast ?? true;
        // hide confirm button for auto-close toasts unless developer asked otherwise
        if (typeof opts.showConfirmButton === 'undefined') cfg.showConfirmButton = false;
    } else {
        // no timer: do not set timer; if toast explicitly requested, keep it but do not auto-close
        if (opts.toast) {
            cfg.toast = true;
            // when toast without timer, keep confirm button so user can dismiss
            if (typeof opts.showConfirmButton === 'undefined') cfg.showConfirmButton = true;
        }
        // if no toast and no timer, leave default modal behavior (requires user action)
    }

    return cfg;
}

export const showSuccessMessage = (title: string, text?: string, opts: AlertOpts = {}) => {
    return Swal.fire(buildConfig('success', title, text, opts));
};

export const showWarningMessage = (title: string, text?: string, opts: AlertOpts = {}) => {
    return Swal.fire(buildConfig('warning', title, text, opts));
};

export const showErrorMessage = (title: string, text?: string, opts: AlertOpts = {}) => {
    return Swal.fire(buildConfig('error', title, text, opts));
};

export const showInfoMessage = (title: string, text?: string, opts: AlertOpts = {}) => {
    return Swal.fire(buildConfig('info', title, text, opts));
};

export default {
    showSuccessMessage,
    showWarningMessage,
    showErrorMessage,
    showInfoMessage,
};
