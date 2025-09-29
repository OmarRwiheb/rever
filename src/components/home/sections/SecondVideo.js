import OptimizedVideoSection from "../layout/OptimizedVideoSection";

export default function SecondVideo() {
    return (
        <OptimizedVideoSection 
            src="" 
            priority={false} // Lazy load this video
        />
    );
}   