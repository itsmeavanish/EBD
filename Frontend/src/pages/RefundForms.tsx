import { useState } from 'react';
import Card from '../components/Card';
import OrderForm from '../components/forms/OrderForm';
import RefundFormWithVerification from '../components/forms/RefundFormWithVerification';

const refundForms = {
  leftColumn: [
    { title: "Ayuzera 1.0 S8 Refund form", onClick: "Ayuzera 1.0" },
    { title: "Crowny 1.0 S8 Refund form", onClick: "Crowny 1.0" },
    { title: "Icon 1.0 S8 Refund form", onClick: "Icon 1.0" },
    { title: "Tandul 1.0 S8 Refund form", onClick: "Tandul 1.0" },
    { title: "QNT 1.0 S8 Refund form", onClick: "QNT 1.0" },
    { title: "Musclefood 1.0 S8 Refund form", onClick: "Musclefood 1.0" },
    { title: "DR. B's Readers 1.0 S8 Refund form", onClick: "DR. B's Readers 1.0" },
    { title: "Prograniq 1.0 S8 Refund form", onClick: "Prograniq 1.0" },
    { title: "Globus 1.0 S8 Refund form", onClick: "Globus 1.0" },
  ],
  rightColumn: [
    { title: "Autoimmunity 1.0 S8 Refund form", onClick: "Autoimmunity 1.0" },
    { title: "HYGIENE-ON 1.0 S8 Refund form", onClick: "HYGIENE-ON 1.0" },
    { title: "Veda Pure 1.0 S8 Refund form", onClick: "Veda Pure 1.0" },
    { title: "Cassidy 1.0 S8 Refund form", onClick: "Cassidy 1.0" },
    { title: "CareVeda 1.0 S8 Refund form", onClick: "CareVeda 1.0" },
    { title: "Saundaryam 1.0 S8 Refund form", onClick: "Saundaryam 1.0" },
    { title: "Z Guard 1.0 S8 Refund form", onClick: "Z Guard 1.0" },
    { title: "Nutrazen 1.0 S8 Refund form", onClick: "Nutrazen 1.0" },
  ],
};


export default function RefundForms() {
  const [activeForm, setActiveForm] = useState<string | null>(null);

  const handleFormClick = (form: string) => {
    setActiveForm(form);
    console.log("Selected Form:", form);
  };
    const handleBackToForms = () => {
    setActiveForm(null);
  };

  if (activeForm) {
    return <RefundFormWithVerification onBack={handleBackToForms} />;
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Forms Management</h1>
        <h2 className="text-lg text-gray-600">Refund Forms</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full mt-4"></div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {refundForms.leftColumn.map((form, index) => (
          <Card
            key={`left-${index}`}
            title={form.title}
            onClick={() => handleFormClick(form.onClick)}
          />
        ))}

        {refundForms.rightColumn.map((form, index) => (
          <Card
            key={`right-${index}`}
            title={form.title}
            onClick={() => handleFormClick(form.onClick)}
          />
        ))}
      </div>

      {/* Example of showing active form */}
      {activeForm && (
        <div className="mt-8 text-center">
          <p className="text-lg font-medium text-gray-800">
            You selected: <span className="text-purple-600">{activeForm}</span>
          </p>
        </div>
      )}
    </div>
  );
}
