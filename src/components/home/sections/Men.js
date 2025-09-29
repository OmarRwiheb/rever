import ImageSection from "../layout/ImageSection";
import Link from "next/link";
export default function Men(props) {
    return (
        <Link href={props.link}>
            <ImageSection src="/img/men.webp" priority={true} alt="Men" />
        </Link>
    );
}