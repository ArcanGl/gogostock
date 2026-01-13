export function checkCredentials(username: string, password: string) {
  const envUser = process.env.NEXT_PUBLIC_APP_USERNAME ?? "";
  const envPass = process.env.NEXT_PUBLIC_APP_PASSWORD ?? "";
  return username === envUser && password === envPass;
}
