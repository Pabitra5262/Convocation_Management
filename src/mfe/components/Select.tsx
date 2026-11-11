import WireSelect from "@/shared/components/ui/Forms/Select/Select";
import type { Option } from "@/shared/components/ui/Forms/form.types";

/* hplus_react `@mfe/components` Select API: onChange gets the chosen value (or values), not a change event. */

interface BaseSelectProps {
    options?: Option[];
    label?: string;
    error?: string;
    helpText?: string;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    id?: string;
    onSearch?: (term: string) => Promise<Option[]>;
    debounceMs?: number;
    showSearch?: boolean;
    className?: string;
    name?: string;
    "aria-label"?: string;
}
export interface SingleSelectProps extends BaseSelectProps {
    multiple?: false;
    value?: string | number;
    onChange: (value: string | number) => void;
}
export interface MultiSelectProps extends BaseSelectProps {
    multiple: true;
    value?: (string | number)[];
    onChange: (values: (string | number)[]) => void;
}
export type SelectProps = SingleSelectProps | MultiSelectProps;
export type { Option };

export const Select = (props: SelectProps) => {
    const { options = [], value, onChange, multiple, onSearch: _onSearch, debounceMs: _debounce, showSearch: _showSearch, readOnly, ...rest } = props;
    return (
        <WireSelect
            {...rest}
            options={options}
            multiple={multiple}
            disabled={rest.disabled || readOnly}
            value={value as string | number | readonly string[] | undefined}
            onChange={(e) => {
                if (multiple) {
                    (onChange as MultiSelectProps["onChange"])(Array.from(e.target.selectedOptions, (o) => o.value));
                } else {
                    (onChange as SingleSelectProps["onChange"])(e.target.value);
                }
            }}
        />
    );
};

export default Select;
