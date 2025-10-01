import OptimizedVideoSection from "../layout/OptimizedVideoSection";

export default function Hero() {
    return (
        <OptimizedVideoSection 
            src="/vid/main_desktop.mp4" 
            mobileSrc="/vid/vertical.mp4"
            priority={true} // Hero video loads immediately
        />
    );
}