import { BookingForm } from "./BookingForm";

export const dynamic = "force-dynamic";

export default async function BookingFormPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const d = await (
    await fetch(
      `${process.env.NEXT_PUBLIC_CONVEX_HTTP_URL!}/get-data/${params.id}`,
      {
        cache: "no-store",
      }
    )
  ).json();

  return (
    <main>
      <BookingForm id={params.id} bookingForm={d} />
    </main>
  );
}
