import { BookingForm } from "./BookingForm";

export default function BookingFormPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  console.log(params.id);

  return (
    <main>
      <BookingForm id={params.id} />
    </main>
  );
}
