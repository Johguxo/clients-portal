import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-sm font-medium text-foreground">
        Este ticket no existe o no tienes acceso.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Puede que se haya eliminado o que pertenezca a otra organización.
      </p>
      <Link
        href="/tickets"
        className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
      >
        Volver a tickets
      </Link>
    </div>
  );
}
