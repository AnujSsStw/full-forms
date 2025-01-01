import { ReportValidator } from "./ReportValidator";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "@/app/report/editor.css";

export default function ReportPage() {
  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Legal Report System</h1>
      <ReportValidator />
    </main>
  );
}
