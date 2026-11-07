import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CONTACT, type ContactInfo } from "@/lib/school";
import type { EventRow } from "@/lib/content";

export type PostRow = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  image_url: string | null;
  published: boolean;
  published_at: string;
};

export const postsQuery = queryOptions({
  queryKey: ["posts", "public"],
  queryFn: async (): Promise<PostRow[]> => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (error) throw error;
    return data as PostRow[];
  },
});

export const eventsQuery = queryOptions({
  queryKey: ["events", "public"],
  queryFn: async (): Promise<EventRow[]> => {
    const { data, error } = await supabase.from("events").select("*").eq("published", true);
    if (error) throw error;
    return data as EventRow[];
  },
});

export const contactQuery = queryOptions({
  queryKey: ["settings", "contact"],
  queryFn: async (): Promise<ContactInfo> => {
    const { data } = await supabase.from("site_settings").select("value").eq("key", "contact").maybeSingle();
    return { ...DEFAULT_CONTACT, ...((data?.value as Partial<ContactInfo>) ?? {}) };
  },
  placeholderData: DEFAULT_CONTACT,
  staleTime: 5 * 60_000,
});
