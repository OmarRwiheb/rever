// components/UI/Footer.js
const Footer = ({ fullPage = false }) => {
    return (
        <div
        className={`${
            fullPage ? "h-screen" : "py-20"
        } w-full flex flex-col items-center justify-center bg-white text-black`}
        >
        <div className="max-w-6xl w-full px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
            {/* Columns */}
            <div>
            <h4 className="font-semibold mb-2">INTERNATIONAL VERSION</h4>
            <p>ENGLISH</p>
            </div>
            <div>
            <h4 className="font-semibold mb-2">CLIENT SERVICE</h4>
            <p>Email Us</p>
            <p>Book Appointment →</p>
            </div>
            <div>
            <h4 className="font-semibold mb-2">LEGAL NOTICES</h4>
            <p>Accessibility</p>
            </div>
            <div>
            <h4 className="font-semibold mb-2">NEWSLETTER →</h4>
            </div>
        </div>
        <div className="flex items-center space-x-6 text-xl mt-8">{/* Icons */}</div>
        </div>
    );
};

export default Footer;
  