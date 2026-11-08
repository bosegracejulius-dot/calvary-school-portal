import { queryOptions } from '@tanstack/react-query';
import { getPublicContent } from './public.functions';
export const siteQuery = queryOptions({ queryKey: ['school', 'public-content'], queryFn: () => getPublicContent(), staleTime: 60000 });
