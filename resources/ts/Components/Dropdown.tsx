import React, {
    useState,
    createContext,
    useContext,
    Fragment,
    ReactNode,
} from "react";
import { Link } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import type { Method } from "@inertiajs/core";

// ---------------- Context ----------------

type DropDownContextType = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    toggleOpen: () => void;
};

const DropDownContext = createContext<DropDownContextType | undefined>(
    undefined
);

// ---------------- Root Dropdown ----------------

type DropdownProps = {
    children: ReactNode;
};

const Dropdown = ({ children }: DropdownProps) => {
    const [open, setOpen] = useState(false);
    const toggleOpen = () => setOpen((prev) => !prev);

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

// ---------------- Trigger ----------------

type TriggerProps = {
    children: ReactNode;
};

const Trigger = ({ children }: TriggerProps) => {
    const context = useContext(DropDownContext);
    if (!context)
        throw new Error("Dropdown.Trigger must be used within a Dropdown");

    const { open, setOpen, toggleOpen } = context;

    return (
        <>
            <div onClick={toggleOpen}>{children}</div>
            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                />
            )}
        </>
    );
};

// ---------------- Content ----------------

type ContentProps = {
    align?: "left" | "right";
    width?: string;
    contentClasses?: string;
    children: ReactNode;
};

const Content = ({
    align = "right",
    width = "48",
    contentClasses = "py-1 bg-white",
    children,
}: ContentProps) => {
    const context = useContext(DropDownContext);
    if (!context)
        throw new Error("Dropdown.Content must be used within a Dropdown");

    const { open, setOpen } = context;

    const alignmentClasses =
        align === "left"
            ? "origin-top-left left-0"
            : align === "right"
            ? "origin-top-right right-0"
            : "origin-top";

    const widthClasses = width === "48" ? "w-48" : "";

    return (
        <Transition
            as={Fragment}
            show={open}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
        >
            <div
                className={`absolute z-50 mt-2 rounded-md shadow-lg ${alignmentClasses} ${widthClasses}`}
                onClick={() => setOpen(false)}
            >
                <div
                    className={`rounded-md ring-1 ring-black ring-opacity-5 ${contentClasses}`}
                >
                    {children}
                </div>
            </div>
        </Transition>
    );
};

// ---------------- Dropdown Link ----------------

type DropdownLinkProps = {
    href: string;
    method?: Method;
    as?: string;
    children: ReactNode;
};

const DropdownLink = ({
    href,
    method,
    as = "a",
    children,
}: DropdownLinkProps) => {
    return (
        <Link
            href={href}
            {...(method ? { method } : {})} // ✅ hanya tambahkan jika ada
            as={as}
            className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out"
        >
            {children}
        </Link>
    );
};

// ---------------- Compose all parts ----------------

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
