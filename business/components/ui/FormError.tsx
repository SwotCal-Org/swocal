export function FormError({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-r3 border-2 border-danger bg-coral-soft px-4 py-3 text-sm text-ink">
      {message}
    </div>
  );
}
