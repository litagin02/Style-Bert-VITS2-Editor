export async function fetchApi<T>(
  endpoint: string, options: RequestInit = {}, responseType: 'json' | 'blob' | 'text' = 'json'
):
  Promise<T> {
  console.log('fetchApi', endpoint);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const fullUrl = `${baseUrl}${endpoint}`;

  const res = await fetch(fullUrl, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) {
    throw new Error(`Network response was not ok (${res.status})`);
  }

  switch (responseType) {
    case 'json':
      return await res.json() as T;
    case 'blob':
      return await res.blob() as unknown as T;
    case 'text':
      return await res.text() as unknown as T;
    default:
      return await res.json() as T;
  }
}
