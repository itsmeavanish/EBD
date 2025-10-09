import { useState } from 'react';
import Card from '../components/Card';
import OrderForm from '../components/forms/OrderForm';

const orderForms = {
  leftColumn: [
    { title: "Autoimmunity 1.0 S8 Order Form", onClick: "Autoimmunity 1.0" },
    { title: "DR. B's Readers 1.0 S8 Order Form", onClick: "DR. B's Readers 1.0" },
    { title: "Tandul 1.0 S8 Order Form", onClick: "Tandul 1.0" },
    { title: "CareVeda 1.0 S8 Order Form", onClick: "CareVeda 1.0" },
    { title: "Z Guard 1.0 S8 Order Form", onClick: "Z Guard 1.0" },
    { title: "QNT 1.0 S8 Order Form", onClick: "QNT 1.0" },
    { title: "Globus 1.0 S8 Order Form", onClick: "Globus 1.0" },
  ],
  rightColumn: [
    { title: "Proathlix 1.0 S8 Order Form", onClick: "Proathlix 1.0" },
    { title: "Veda Pure 1.0 S8 Order Form", onClick: "Veda Pure 1.0" },
    { title: "Cassidy 1.0 S8 Order Form", onClick: "Cassidy 1.0" },
    { title: "Ayuzera 2.0 S8 Order Form", onClick: "Ayuzera 2.0" },
    { title: "Prograniq 1.0 S8 Order Form", onClick: "Prograniq 1.0" },
    { title: "Nutrazen 1.0 S8 Order Form", onClick: "Nutrazen 1.0" },
    { title: "Gymgums 1.0 S8 Order Form", onClick: "Gymgums 1.0" },
  ],
};

export default function OrderForms() {
  const [activeForm, setActiveForm] = useState<string | null>(null);

  const handleFormClick = (form: string) => {
    setActiveForm(form);
    console.log("Selected Form:", form);
  };
    const handleBackToForms = () => {
    setActiveForm(null);
  };

  if(activeForm){
    return <OrderForm onBack={handleBackToForms} />;
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Forms Management</h1>
        <h2 className="text-lg text-gray-600">Order Forms</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full mt-4"></div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {orderForms.leftColumn.map((form, index) => (
          <Card
            key={`left-${index}`}
            title={form.title}
            onClick={() => handleFormClick(form.onClick)}
          />
        ))}

        {orderForms.rightColumn.map((form, index) => (
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
