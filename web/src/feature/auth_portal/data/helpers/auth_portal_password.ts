const PASSWORD_PREFIX = 'local-auth:';

const encodeBase64 = (value: string): string => {
    if (typeof btoa === 'function') {
        return btoa(unescape(encodeURIComponent(value)));
    }

    return Buffer.from(value, 'utf-8').toString('base64');
};

export const hashAuthPortalPassword = (value: string): string =>
    `${PASSWORD_PREFIX}${encodeBase64(value.trim())}`;

export const verifyAuthPortalPassword = (password: string, passwordHash: string): boolean =>
    hashAuthPortalPassword(password) === passwordHash;
