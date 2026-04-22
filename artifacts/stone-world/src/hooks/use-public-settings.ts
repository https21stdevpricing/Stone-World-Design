import { useQuery } from "@tanstack/react-query";

export interface PublicSettings {
  companyName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
}

async function fetchPublicSettings(): Promise<PublicSettings> {
  const res = await fetch("/api/settings/public");
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json() as Promise<PublicSettings>;
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ["public-settings"],
    queryFn: fetchPublicSettings,
    staleTime: 5 * 60 * 1000,
  });
}
