import { QRCodeSVG } from "qrcode.react";
const User = ({ users }: any) => {
    return (
        <div className="min-h-screen grid grid-cols-3 gap-10  p-10 justify-items-center">
            {users.map((user: any) => (
                <div key={user.id} className="flex flex-col items-center">
                    <QRCodeSVG
                        value={user.barcode}
                        size={220}
                        level="H"
                        imageSettings={{
                            src: "/assets/images/logo.webp",
                            height: 60,
                            width: 60,
                            excavate: true,
                        }}
                    />

                    <span className="mt-10">{user.name}</span>
                </div>
            ))}
        </div>
    );
};
export default User;
