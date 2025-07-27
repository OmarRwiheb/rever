export default function ImageSection({ src, alt }) {
    return (
        <div className="w-full h-full relative bg-black">
            <img src={src} alt={alt} className="w-full h-full object-cover" />
        </div>
    );
}