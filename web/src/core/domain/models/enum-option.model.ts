export interface EnumOptionModel<TValue extends string | number> {
    value: TValue;
    label: string;
    helper?: string;
}
