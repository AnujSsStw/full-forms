import { RiversideCountySheriffForm } from "./CauseForm";

export default async function BookingFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const d = await (
    await fetch(`${process.env.NEXT_PUBLIC_CONVEX_HTTP_URL!}/get-data/${id}`, {
      next: {
        revalidate: 0,
      },
    })
  ).json();

  return (
    <main>
      <RiversideCountySheriffForm
        id={id}
        data={d}
        firstMsgId={d.isFirstMsgId}
      />
    </main>
  );
}
