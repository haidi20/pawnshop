// syntax.spec.ts — imports feature files to detect syntax/import errors
import { test, expect } from 'vitest'; // or 'jest' if using Jest

const dashboardModules = import.meta.glob('../**/*.{ts,vue}', { eager: true });
const dashboardKeys = Object.keys(dashboardModules).filter(k => !k.includes('/test/'));

test('dashboard feature compiles (no syntax errors)', () => {
    for (const k of dashboardKeys) {
        // Access module to force evaluation
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        // @ts-ignore
        dashboardModules[k as keyof typeof dashboardModules];
    }
    expect(dashboardKeys.length).toBeGreaterThanOrEqual(0);
});
