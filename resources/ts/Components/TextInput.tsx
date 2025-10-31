import React, { forwardRef, useEffect, useRef, ChangeEvent, Ref } from "react";

type TextInputProps = {
    type?: string;
    name?: string;
    id?: string;
    value?: string | number;
    className?: string;
    autoComplete?: string;
    required?: boolean;
    isFocused?: boolean;
    handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    (
        {
            type = "text",
            name,
            id,
            value,
            className = "",
            autoComplete,
            required = false,
            isFocused = false,
            handleChange,
        },
        ref
    ) => {
        const internalRef = useRef<HTMLInputElement>(null);
        const inputRef = (ref as Ref<HTMLInputElement>) || internalRef;

        useEffect(() => {
            if (isFocused && internalRef.current) {
                internalRef.current.focus();
            }
        }, [isFocused]);

        return (
            <div className="flex flex-col items-start">
                <input
                    type={type}
                    name={name}
                    id={id}
                    value={value}
                    className={`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ${className}`}
                    ref={inputRef}
                    autoComplete={autoComplete}
                    required={required}
                    onChange={handleChange}
                />
            </div>
        );
    }
);

TextInput.displayName = "TextInput";

export default TextInput;
