import { ReportValidator } from "./ReportValidator";

export default function ReportPage() {
  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Legal Report System</h1>
      <ReportValidator />
    </main>
  );
}
