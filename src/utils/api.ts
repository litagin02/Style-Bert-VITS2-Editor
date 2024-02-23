export async function fetchApi<T>(
  endpoint: string, options: RequestInit = {}, responseType: 'json' | 'blob' | 'text' = 'json'
):
  Promise<T> {
  console.log('fetchApi', endpoint, responseType, options);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const fullUrl = `${baseUrl}${endpoint}`;

  const res = await fetch(fullUrl, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) {
    const error = await res.json();
    console.error("Error code: ", res.status, "Error message: ", error);
    throw new Error(error);
  }

  switch (responseType) {
    case 'json':
      return await res.json() as T;
    case 'blob':
      return await res.blob() as T;
    case 'text':
      return await res.text() as T;
    default:
      return await res.json() as T;
  }
}