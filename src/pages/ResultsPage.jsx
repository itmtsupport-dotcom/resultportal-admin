import React, { useState } from "react";
import AllResults from "../components/AllResults";
import ResultsManualUpload from "../components/ResultsManualUpload";
import ResultsBulkUpload from "../components/ResultsBulkUpload";
import ManageCourses from "../components/ManageCourses";
import ManageDepartments from "../components/ManageDepartments";
import ManageYears from "../components/ManageYears";
import ManageExams from "../components/ManageExams";
import ManageClasses from "../components/ManageClasses";
import { Upload, FileText, BookOpen, Layers, Calendar, ClipboardList, Users, List } from "lucide-react";

const ResultsPage = () => {
  const [activeTab, setActiveTab] = useState("all-results");

  const tabs = [
    { id: "all-results", label: "All Results", icon: List },
    { id: "manual", label: "Manual Upload", icon: FileText },
    { id: "bulk", label: "Bulk Upload", icon: Upload },
    { id: "courses", label: "Manage Courses", icon: BookOpen },
    { id: "departments", label: "Manage Departments", icon: Layers },
    { id: "years", label: "Manage Year", icon: Calendar },
    { id: "exams", label: "Manage Exam", icon: ClipboardList },
    { id: "classes", label: "Manage Class", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Results & Academics</h2>
        <p className="text-gray-500">Manage results uploads, courses, years, exams, classes, and departments.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto pb-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                  ${isActive 
                    ? "border-blue-600 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
                `}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "all-results" && <AllResults />}
        {activeTab === "manual" && <ResultsManualUpload />}
        {activeTab === "bulk" && <ResultsBulkUpload />}
        {activeTab === "courses" && <ManageCourses />}
        {activeTab === "departments" && <ManageDepartments />}
        {activeTab === "years" && <ManageYears />}
        {activeTab === "exams" && <ManageExams />}
        {activeTab === "classes" && <ManageClasses />}
      </div>
    </div>
  );
};

export default ResultsPage;
