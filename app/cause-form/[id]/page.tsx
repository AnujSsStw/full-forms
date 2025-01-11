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
      `${process.env.NEXT_PUBLIC_CONVEX_HTTP_URL!}/get-data/${params.id}`,
      {
        next: {
          revalidate: 0,
        },
      }
    )
  ).json();

  return (
    <main>
      <RiversideCountySheriffForm
        id={params.id}
        data={d}
        firstMsgId={d.isFirstMsgId}
      />
    </main>
  );
}
