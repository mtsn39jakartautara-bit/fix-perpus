export default function Error404() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-red-500">404</h1>

                <p className="mt-4 text-xl font-semibold">Page Not Found</p>

                <a
                    href="/"
                    className="mt-6 inline-block rounded-lg bg-black px-5 py-2 text-white"
                >
                    Kembali
                </a>
            </div>
        </div>
    );
}
