import "./globals.css";

export const metadata = {
    title: 'ICEN B2B · Ventas FUNDAE',
    description: 'Backend interno para closers, propuestas FUNDAE y proformas Holded',
}

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    )
}
