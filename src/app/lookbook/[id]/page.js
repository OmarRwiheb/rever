import { shopifyService } from '../../../services/shopify/shopify';
import LookbookDetailClient from '../../../components/lookbook/LookbookDetailClient';

// Generate dynamic metadata for each lookbook
export async function generateMetadata({ params }) {
  try {
    const lookbook = await shopifyService.getLookbookByHandle(params.id);
    
    if (!lookbook) {
      return {
        title: 'Lookbook Not Found | Rever',
        description: 'The requested lookbook could not be found.',
      };
    }

    return {
      title: `${lookbook.name} | Rever Lookbooks`,
      description: `Explore the ${lookbook.name} lookbook featuring curated fashion pieces and styling inspiration. Shop the complete look and discover your new favorite pieces.`,
      keywords: [lookbook.name, lookbook.category, 'lookbook', 'fashion', 'styling', 'outfits'],
      openGraph: {
        title: `${lookbook.name} | Rever Lookbooks`,
        description: `Explore the ${lookbook.name} lookbook featuring curated fashion pieces and styling inspiration.`,
        images: [
          {
            url: lookbook.imageUrl,
            width: 1200,
            height: 630,
            alt: `${lookbook.name} - Rever Lookbook`,
          },
        ],
      },
      twitter: {
        title: `${lookbook.name} | Rever Lookbooks`,
        description: `Explore the ${lookbook.name} lookbook featuring curated fashion pieces and styling inspiration.`,
        images: [lookbook.imageUrl],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Lookbook | Rever',
      description: 'Explore our curated lookbook featuring fashion pieces and styling inspiration.',
    };
  }
}

export default function OutfitDetailPage({ params }) {
  return <LookbookDetailClient lookbookHandle={params.id} />;
}