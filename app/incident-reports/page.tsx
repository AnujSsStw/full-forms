"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SirEntryForm } from "./sir-entry-form";
import { ReportViewer } from "./report-viewer";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

function DashboardHeader() {
  return (
    <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
      <div className="flex items-center space-x-3">
        <div className="rounded-lg bg-primary p-2 text-primary-foreground">
          <ClipboardList size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Situational Incident Reports
          </h1>
          <p className="text-muted-foreground">
            Manage and report incidents efficiently
          </p>
        </div>
      </div>
    </div>
  );
}

export default function IncidentReportsPage() {
  const [activeTab, setActiveTab] = useState("entry");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <DashboardHeader />

      <Tabs
        defaultValue="entry"
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="entry">New Entry</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <SirEntryForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <ReportViewer />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
