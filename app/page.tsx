import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FileText, Search, Clock } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Hero />
    </main>
  );
}

function Hero() {
  return (
    <div className=" py-4">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Streamlined Police Report Management
            </h1>
            <p className="text-xl">
              Your go-to platform for drafting reports, probable cause
              statements, and booking sheets. Disclaimer: This tool is for
              informational purposes only and not for official use
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={"/booking-form"}>
                <Button size="lg" variant="secondary">
                  <FileText className="mr-2 h-5 w-5" />
                  New Report
                </Button>
              </Link>
              <Link href={"/booking-form?search=true"}>
                <Button size="lg" variant="outline" className="bg-white/10">
                  {" "}
                  <Search className="mr-2 h-5 w-5" />
                  Search Reports
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative hidden md:block">
            <Image
              src="/bg.jpg"
              alt="Police Report Illustration"
              width={500}
              height={500}
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
