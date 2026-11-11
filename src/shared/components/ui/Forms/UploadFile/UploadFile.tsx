import { File as FileIcon } from "lucide-react";
import React from "react";
import { inputBase, inputNormal, inputError, inputDisabled } from "../inputStyles";

interface FileUploadProps {
    label?: string;
    value?: File | string | null;
    onChange: (file: File | null) => void;
    accept?: string;
    error?: string;
    helpText?: string;
    required?: boolean;
    disabled?: boolean;
    id?: string;
    name?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
}

const FileUpload: React.FC<Readonly<FileUploadProps>> = ({
    label, value, onChange, accept, error, helpText, required, disabled,
    id, name, wrapperClassName = "", labelClassName = "", errorClassName = "",
}) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const autoId = React.useId();
    const inputId = id || (name ? `file-upload-${name}` : autoId);


    const containerClasses = [
        inputBase,
        error ? inputError : inputNormal,
        disabled ? inputDisabled : "",
        "flex items-center justify-between cursor-pointer text-left",
    ].join(" ");

    const getFileName = () => {
        if (!value) return "Choose file...";
        if (typeof value === "string") return value.split(/[\\/]/).pop() || value;
        return (value as File).name;
    };

    return (
        <div className={wrapperClassName}>
            {label && (
                <label
                    htmlFor={inputId}
                    className={`ui-label ${labelClassName}`}
                >
                    {label}{required && <span className="ui-required" aria-hidden>*</span>}
                </label>
            )}


            <button
                type="button"
                className={containerClasses}
                onClick={() => !disabled && fileInputRef.current?.click()}
                disabled={disabled}
            >

                <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                    <FileIcon
                        size={15}
                        className={value ? "text-primary shrink-0" : "text-muted shrink-0"}
                    />
                    <span className={`text-sm truncate ${value ? "text-foreground" : "text-muted"}`}>
                        {getFileName()}
                    </span>
                </div>


                <span
                    className={`ml-3 shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded transition-colors ${value
                        ? "bg-muted/20 text-muted-foreground"
                        : "bg-primary text-white"
                        }`}
                >
                    {value ? "Change" : "Browse"}
                </span>
            </button>

            <input
                ref={fileInputRef}
                id={inputId}
                name={name}
                type="file"
                className="hidden"
                accept={accept}
                disabled={disabled}
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />

            {helpText && !error && (
                <p className="ui-help">{helpText}</p>
            )}
            {error && (
                <p className={`ui-error ${errorClassName}`} role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

export default FileUpload;
