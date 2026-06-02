import { QRCodeSVG } from "qrcode.react";
const Buku = ({ books }: any) => {
    return (
        <div className="min-h-screen grid grid-cols-3 gap-10  p-10 justify-items-center">
            {books.map((book: any) => (
                <div key={book.id} className="flex flex-col items-center">
                    <QRCodeSVG
                        value={book.barcode}
                        size={220}
                        level="H"
                        imageSettings={{
                            src: "/assets/images/logo.webp",
                            height: 60,
                            width: 60,
                            excavate: true,
                        }}
                    />

                    <span className="mt-10">{book.book_title}</span>
                </div>
            ))}
        </div>
    );
};
export default Buku;
