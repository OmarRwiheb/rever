import OptimizedVideoSection from "../layout/OptimizedVideoSection";

export default function SecondVideo() {
    return (
        <OptimizedVideoSection 
            src="/vid/secondary.mp4" 
            priority={false} // Lazy load this video
        />
    );
}   