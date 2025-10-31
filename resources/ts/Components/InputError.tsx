import React from "react";

// InputError.tsx
type InputErrorProps = {
    message?: string | undefined; // ✅ tambahkan `| undefined`
    className?: string;
};

export default function InputError({
    message,
    className = "",
}: InputErrorProps) {
    return message ? (
        <p className={`text-sm text-red-600 ${className}`}>{message}</p>
    ) : null;
}
