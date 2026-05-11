/** JSON-LD for Hotel / LodgingBusiness (lightweight). */
export function buildHotelJsonLd(input: {
  name: string;
  description: string;
  slug: string;
  city: string;
  country: string;
  images?: string[];
}) {
  const origin =
    process.env.NEXT_PUBLIC_WEB_ORIGIN ?? process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const url = origin ? `${origin.replace(/\/$/, '')}/hotels/${input.slug}` : `/hotels/${input.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: input.name,
    description: input.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: input.city,
      addressCountry: input.country,
    },
    image: input.images?.length ? input.images : undefined,
    url,
  };
}

export function buildHotelsListingJsonLd(items: { name: string; slug: string; city: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((h, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: h.name,
      url: `/hotels/${h.slug}`,
    })),
  };
}
