import type { Metadata } from 'next';
import RealEstateExperience from './real-estate-experience';
import './real-estate.css';

export const metadata: Metadata = {
  title: 'Utah Homes | Mohammed Alhareb',
  description: 'Explore Utah living with Mohammed Alhareb. Discover communities, plan your next move, and connect your home search with practical real estate investment tools.',
  alternates: { canonical: 'https://homeswithmohammed.com/real-estate' },
  openGraph: {
    title: 'Homes with Mohammed | Utah Homes. Your Next Chapter.',
    description: 'Explore communities, buying and selling guides, and real estate tools with Mohammed Alhareb.',
    images: [{ url: 'https://homeswithmohammed.com/images/utah-homes-hero.webp', width: 1983, height: 793, alt: 'Illustrative Utah home and mountain landscape' }],
  },
};

export default function RealEstatePage() {
  return <RealEstateExperience />;
}
