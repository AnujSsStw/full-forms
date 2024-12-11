import { BookingForm } from "./BookingForm";

export default async function BookingFormPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const d = await (
    await fetch(
      `https://healthy-kangaroo-437.convex.site/get-data/${params.id}`
    )
  ).json();

  return (
    <main>
      <BookingForm id={params.id} bookingForm={d} />
    </main>
  );
}
