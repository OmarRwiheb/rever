import ImageSection from "../layout/ImageSection";
import Link from "next/link";
export default function Men(props) {
    return (
        <Link href={props.link}>
            <ImageSection 
                src="/img/hero1.jpg" 
                priority={true} 
                alt="lookbook" 
                overlayText="Click to view our lookbooks"
            />
        </Link>
    );
}