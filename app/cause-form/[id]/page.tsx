import { RiversideCountySheriffForm } from "./CauseForm";

export default function BookingFormPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  return (
    <main>
      <RiversideCountySheriffForm id={params.id} />
    </main>
  );
}
