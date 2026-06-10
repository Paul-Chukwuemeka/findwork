export async function checkUserExists(email: string): Promise<boolean> {
  const res = await fetch(`/api/auth/user-exists?email=${encodeURIComponent(email)}`,
  );
  if (!res.ok) throw new Error("Could not verify account status.");
  const data = await res.json();
  return Boolean(data.exists);
}
