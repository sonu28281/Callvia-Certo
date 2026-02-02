import { Lock, CreditCard, Building2, AlertTriangle, Package, FileCheck } from 'lucide-react';
import { ServiceCard } from './ServiceCard';

interface EnabledServicesGridProps {
  onSelectService?: (serviceId: string) => void;
}

export default function EnabledServicesGrid({ onSelectService }: EnabledServicesGridProps) {
  const services = [
    {
      id: 'aadhaar',
      icon: Lock,
      title: '🔐 Aadhaar OTP',
      description: 'Verify resident identity via Aadhaar OTP',
    },
    {
      id: 'pan',
      icon: CreditCard,
      title: '🆔 PAN Verification',
      description: 'Verify PAN and fetch name, DOB',
    },
    {
      id: 'bank',
      icon: Building2,
      title: '🏦 Bank Account',
      description: 'Verify bank account via NEFT/IMPS',
    },
    {
      id: 'risk',
      icon: AlertTriangle,
      title: '🎯 Risk Assessment',
      description: 'Quick pass/review/fail decision',
    },
    {
      id: 'bulk',
      icon: Package,
      title: '📦 Bulk KYC (CSV)',
      description: 'Verify multiple customers in batch',
    },
    {
      id: 'audit',
      icon: FileCheck,
      title: '🎯 Consent & Audit',
      description: 'View all consents & audit trail',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          id={service.id}
          icon={service.icon}
          title={service.title}
          description={service.description}
          onClick={() => onSelectService?.(service.id)}
        />
      ))}
    </div>
  );
}
