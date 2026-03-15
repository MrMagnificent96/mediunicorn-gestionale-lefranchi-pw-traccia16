// assets
import { IconDashboard, IconCalendarEvent, IconFileReport, IconListDetails } from '@tabler/icons-react';

const icons = { IconDashboard, IconCalendarEvent, IconFileReport, IconListDetails };

const clinica = {
  id: 'clinica-medica',
  title: 'Gestione Clinica',
  type: 'group',
  children: [
    {
      id: 'dashboard-economica',
      title: 'Dashboard Economica',
      type: 'item',
      url: '/dashboard/default', // Lasciamo la dashboard di default per ora
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    {
      id: 'gestione-prenotazioni',
      title: 'Nuova Prenotazione',
      type: 'item',
      url: '/prenotazioni', // Creeremo questa pagina a breve
      icon: icons.IconCalendarEvent,
      breadcrumbs: false
    },
    {
      id: 'archivio-prenotazioni',
      title: 'Archivio Prenotazioni',
      type: 'item',
      url: '/archivio-prenotazioni',
      icon: icons.IconListDetails,
      breadcrumbs: false
    },
    {
      id: 'archivio-referti',
      title: 'Registrazione Referti',
      type: 'item',
      url: '/referti', // Creeremo questa pagina a breve
      icon: icons.IconFileReport,
      breadcrumbs: false
    }
  ]
};

export default clinica;