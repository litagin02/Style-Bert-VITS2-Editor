export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  responseType: 'json' | 'blob' | 'text' = 'json',
): Promise<T> {
  console.log('fetchApi', endpoint, responseType, options);
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? process.env.NEXT_PUBLIC_API_URL // 開発環境では.envから読み込む
      : ''; // 本番環境では相対URLを使用
  const fullUrl = `${baseUrl}/api${endpoint}`;

  const res = await fetch(fullUrl, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json();
    console.error('Error code: ', res.status, 'Error message: ', error.detail);
    throw new Error(error.detail);
  }

  let result: T;
  switch (responseType) {
    case 'json':
      result = await res.json();
      break;
    case 'blob':
      result = await res.blob() as unknown as T;
      break;
    case 'text':
      result = await res.text() as unknown as T;
      break;
    default:
      result = res.status === 204 ? ({} as T) : (await res.json());
  }

  console.log('fetchApi result', result);
  return result;
}
