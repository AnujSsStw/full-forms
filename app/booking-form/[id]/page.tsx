import { BookingForm } from "./BookingForm";

export const dynamic = "force-dynamic";

export default async function BookingFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const d = await (
    await fetch(`${process.env.NEXT_PUBLIC_CONVEX_HTTP_URL!}/get-data/${id}`, {
      cache: "no-store",
    })
  ).json();

  return (
    <main>
      <BookingForm id={id} bookingForm={d} />
    </main>
  );
}
