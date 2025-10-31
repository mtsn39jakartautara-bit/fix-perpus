import React from "react";

export type CheckboxProps = {
    name: string;
    value?: string | number | readonly string[];
    checked?: boolean; // ✅ tambahkan ini
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
};

export default function Checkbox({
    name,
    value,
    checked,
    handleChange,
    className = "",
}: CheckboxProps) {
    return (
        <input
            type="checkbox"
            name={name}
            value={value}
            checked={checked} // ✅ gunakan checked (bukan value)
            onChange={handleChange}
            className={`rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 ${className}`}
        />
    );
}
