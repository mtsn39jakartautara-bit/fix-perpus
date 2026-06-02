import { router, usePage } from "@inertiajs/react";
import { QRCodeSVG } from "qrcode.react";
const Visit = ({ rooms }: any) => {
    const handlePost = (e: any) => {
        e.preventDefault();

        router.post(route("testing"));
    };

    const page = usePage().props;

    console.log(page.flash);
    return (
        <>
            <div className="min-h-screen grid grid-cols-3 gap-10  p-10 justify-items-center">
                {rooms.map((room: any) => (
                    <div key={room.id} className="flex flex-col items-center">
                        <QRCodeSVG
                            value={room.barcode}
                            size={220}
                            level="H"
                            imageSettings={{
                                src: "/assets/images/logo.webp",
                                height: 60,
                                width: 60,
                                excavate: true,
                            }}
                        />

                        <span className="mt-10">{room.name} </span>
                    </div>
                ))}

                <div>
                    <button onClick={handlePost}>post</button>
                </div>
            </div>
        </>
    );
};
export default Visit;
