import ImageSection from "../layout/ImageSection";
import Link from "next/link";

export default function Women(props) {
    return (
        <Link href={props.link}>
            <ImageSection src="/img/hero2.jpg" overlayText="Click to view the women collection" alt="Women" />
        </Link>
    );
}