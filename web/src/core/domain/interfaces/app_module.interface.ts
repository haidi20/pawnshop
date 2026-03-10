export type AppModuleStatus = 'foundation_ready' | 'in_progress' | 'planned';

export type AppModuleEntityRole = 'primary' | 'child' | 'support';

export interface AppNavigationItem {
    key: string;
    label: string;
    icon: string;
    caption: string;
    route?: string;
    children?: AppNavigationItem[];
}

export interface AppModuleEntityBlueprint {
    key: string;
    label: string;
    tableName: string;
    role: AppModuleEntityRole;
    description: string;
    columns: string[];
}

export interface AppModuleSummary {
    key: string;
    title: string;
    shortTitle: string;
    route: string;
    icon: string;
    phase: string;
    status: AppModuleStatus;
    summary: string;
    goals: string[];
    mainTables: string[];
    childResources: string[];
    entities: AppModuleEntityBlueprint[];
    nextSteps: string[];
}
