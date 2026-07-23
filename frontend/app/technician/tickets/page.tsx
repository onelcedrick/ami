import { Suspense } from 'react';
import TicketListPage from '@/src/pages/technician/TicketListPage';
export default function Page() {
  return (
    <Suspense fallback={null}>
      <TicketListPage />
    </Suspense>
  );
}
