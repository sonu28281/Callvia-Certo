import { Smile, Eye, Briefcase, Building, Video, AlertTriangle } from 'lucide-react';
import { DisabledServiceCard } from './ServiceCard';

export default function ComingSoonServicesGrid() {
  const comingSoonServices = [
    {
      icon: Smile,
      title: '🤳 Face Match',
      description: 'Verify customer identity via facial recognition',
      comingSoon: 'Q2 2026',
    },
    {
      icon: Eye,
      title: '👁️ Liveness Detection',
      description: 'Verify proof of life with liveness detection',
      comingSoon: 'Q2 2026',
    },
    {
      icon: Briefcase,
      title: '🏢 GST Verification',
      description: 'Verify business entity via GST database',
      comingSoon: 'Q3 2026',
    },
    {
      icon: Building,
      title: '🏛️ MCA / Company',
      description: 'Verify corporate identity via MCA database',
      comingSoon: 'Q3 2026',
    },
    {
      icon: Video,
      title: '🎥 Video KYC',
      description: 'Full video-based KYC verification',
      comingSoon: 'Q3 2026',
    },
    {
      icon: AlertTriangle,
      title: '⚠️ Advanced AML',
      description: 'Risk scoring and sanctions list checks',
      comingSoon: 'Q4 2026',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {comingSoonServices.map((service) => (
        <DisabledServiceCard
          key={service.title}
          icon={service.icon}
          title={service.title}
          description={service.description}
          comingSoon={service.comingSoon}
        />
      ))}
    </div>
  );
}
