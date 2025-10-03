import ImageSection from "../layout/ImageSection";
import Link from "next/link";
import { memo } from "react";

const Women = memo(function Women({ link }) {
    return (
        <Link href={link}>
            <ImageSection src="/img/hero2.jpg" overlayText="Click to view the women collection" alt="Women" />
        </Link>
    );
});

// Add display name for better debugging
Women.displayName = 'Women';

export default Women;