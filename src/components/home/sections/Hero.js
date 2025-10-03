import OptimizedVideoSection from "../layout/OptimizedVideoSection";
import { memo } from "react";

const Hero = memo(function Hero() {
    return (
        <OptimizedVideoSection 
            src="/vid/main_desktop.mp4" 
            mobileSrc="/vid/vertical.mp4"
            priority={true} // Hero video loads immediately
        />
    );
});

// Add display name for better debugging
Hero.displayName = 'Hero';

export default Hero;