import { websiteUrl } from '@/lib/constants';
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    {
      url: '',
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: '/work',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: '/channel',
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  return routes.map(({ url, ...rest }) => ({
    ...rest,
    url: `${websiteUrl}${url}`,
    lastModified: new Date(),
  }));
}
