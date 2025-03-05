import {
  ArrestDeclarationFormData,
  ArrestWarrantForm,
} from "./ArrestDeclaration";

export default async function ArrestDeclarationFormPage({
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
      <ArrestWarrantForm id={id} data={d as ArrestDeclarationFormData} />
    </main>
  );
}
