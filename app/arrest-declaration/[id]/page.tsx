import { ArrestWarrantForm } from "./ArrestDeclaration";

export default async function BookingFormPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const d = await (
    await fetch(
      `${process.env.NEXT_PUBLIC_CONVEX_HTTP_URL!}/get-data/${params.id}`
    )
  ).json();

  return (
    <main>
      <ArrestWarrantForm id={params.id} data={d} />
    </main>
  );
}
