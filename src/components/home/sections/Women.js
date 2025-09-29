import ImageSection from "../layout/ImageSection";
import Link from "next/link";

export default function Women(props) {
    return (
        <Link href={props.link}>
            <ImageSection src="/img/women.webp" alt="Women" />
        </Link>
    );
}