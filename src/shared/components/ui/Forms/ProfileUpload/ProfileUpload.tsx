import React, { useEffect, useMemo, useRef } from "react";
import { Upload, X } from "lucide-react";

interface ProfileUploadProps {
    label?: string;
    value?: File | string | null;
    onChange: (file: File | null) => void;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    id?: string;
}

const getAvatarBorderClass = (hasError?: string, isDisabled?: boolean): string => {
    if (hasError) return "border-red-500 bg-red-50/10 hover:bg-red-50/20";
    if (isDisabled) return "border-muted-foreground/30 bg-muted/5 opacity-50 cursor-not-allowed";
    return "border-muted-foreground/30 hover:border-primary bg-muted/5 hover:bg-muted/10 cursor-pointer";
};

const ProfileUpload: React.FC<Readonly<ProfileUploadProps>> = ({
    label,
    value,
    onChange,
    error,
    disabled,
    required,
    wrapperClassName = "",
    labelClassName = "",
    errorClassName = "",
    id,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const autoId = React.useId();
    const inputId = id || autoId;

    const previewUrl = useMemo(() => {
        if (!value) return null;
        if (typeof value === "string") return value;
        if (value instanceof Blob) {
            return URL.createObjectURL(value);
        }
        return null;
    }, [value]);

    useEffect(() => {
        return () => {
            if (previewUrl && typeof value !== "string") {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl, value]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onChange(file);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const avatarBorderClass = getAvatarBorderClass(error, disabled);

    return (
        <div className={`flex flex-col items-center justify-center ${wrapperClassName}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className={`ui-label self-start ${labelClassName}`}
                >
                    {label}{required && <span className="ui-required" aria-hidden>*</span>}
                </label>
            )}

            <div className="relative inline-block">
                <button
                    type="button"
                    onClick={() => !disabled && fileInputRef.current?.click()}
                    disabled={disabled}
                    aria-label={previewUrl ? "Change profile photo" : "Upload profile photo"}
                    className={`w-[110px] h-[110px] rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-all relative overflow-hidden group select-none p-0 ${avatarBorderClass}`}
                >
                    {previewUrl ? (
                        <div className="w-full h-full relative">
                            <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-[10px] font-semibold">Change</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-2 text-center text-muted-foreground group-hover:text-primary">
                            <Upload size={18} className="mb-1 transition-transform group-hover:-translate-y-0.5" />
                            <span className="text-[10px] font-semibold leading-tight">Upload</span>
                        </div>
                    )}
                </button>

                {previewUrl && !disabled && (
                    <button
                        type="button"
                        aria-label="Remove profile photo"
                        onClick={handleClear}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 transition-colors z-10 cursor-pointer border-none"
                    >
                        <X size={10} />
                    </button>
                )}

                <input
                    type="file"
                    id={inputId}
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    disabled={disabled}
                    onChange={handleFileChange}
                />
            </div>

            {error && (
                <p className={`ui-error ${errorClassName}`} role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

export default ProfileUpload;
