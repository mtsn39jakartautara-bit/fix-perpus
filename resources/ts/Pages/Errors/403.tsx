export default function Error403() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-red-500">403</h1>

                <p className="mt-4 text-xl font-semibold">Unauthorized</p>

                <p className="mt-2 text-gray-500">
                    Anda tidak memiliki akses ke halaman ini.
                </p>

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
