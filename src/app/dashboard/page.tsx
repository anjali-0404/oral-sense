import WelcomeSection from '@/components/dashboard/WelcomeSection';
import ActivityOverview from '@/components/dashboard/ActivityOverview';
import DentalHealthOverview from '@/components/dashboard/DentalHealthOverview';
import MainActions from '@/components/dashboard/MainActions';
import NextAppointment from '@/components/dashboard/NextAppointment';
import Navbar from "@/components/Navbar";

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto py-12">
        <WelcomeSection />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ActivityOverview />
            <DentalHealthOverview />
          </div>

          <aside className="space-y-8">
            <MainActions />
            <NextAppointment />
          </aside>
        </div>
      </div>
    </>
  );
}
