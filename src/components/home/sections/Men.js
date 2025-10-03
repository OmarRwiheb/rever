import ImageSection from "../layout/ImageSection";
import Link from "next/link";
import { memo } from "react";

const Men = memo(function Men({ link }) {
    return (
        <Link href={link}>
            <ImageSection src="/img/hero1.jpg" priority={true} overlayText="Click to view our lookbooks" alt="lookbook" />
        </Link>
    );
});

// Add display name for better debugging
Men.displayName = 'Men';

export default Men;