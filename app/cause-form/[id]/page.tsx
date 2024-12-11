import { RiversideCountySheriffForm } from "./CauseForm";

export default async function BookingFormPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const d = await (
    await fetch(
      `https://healthy-kangaroo-437.convex.site/get-data/${params.id}`,
      {
        cache: "no-store",
        next: {
          revalidate: 0,
        },
      }
    )
  ).json();

  return (
    <main>
      <RiversideCountySheriffForm id={params.id} data={d} />
    </main>
  );
}
