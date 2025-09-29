export const prerender = true;
import { getRouteSlugs } from '../lib/i18n';

export async function getStaticPaths() {
  const slugs = getRouteSlugs();
  return slugs.map((slug) => ({ params: { slug } }));
}

export function GET({ params }: { params: { slug: string } }) {
  const to = `/en/${params.slug}`;
  return new Response(null, {
    status: 301,
    headers: { Location: to },
  });
}

