"use client";

import { AppointmentConfirmationModal } from "@/components/appointments/AppointmentConfirmationModal";
import BookingConfirmationStep from "@/components/appointments/BookingConfirmationStep";
import DoctorSelectionStep from "@/components/appointments/DoctorSelectionStep";
import ProgressSteps from "@/components/appointments/ProgressSteps";
import TimeSelectionStep from "@/components/appointments/TimeSelectionStep";
import Navbar from "@/components/Navbar";
import { useBookAppointment, useUserAppointments } from "@/hooks/use-appointment";
import { APPOINTMENT_TYPES } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarIcon, ClockIcon, User2Icon, CheckCircleIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function AppointmentsPage() {
  // state management for the booking process
  const [selectedDentistId, setSelectedDentistId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // 1: select dentist, 2: select time, 3: confirm
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  const bookAppointmentMutation = useBookAppointment();
  const { data: userAppointments = [] } = useUserAppointments();

  const handleSelectDentist = (dentistId: string) => {
    setSelectedDentistId(dentistId);
    // reset the state when dentist changes
    setSelectedDate("");
    setSelectedTime("");
    setSelectedType("");
  };

  const handleBookAppointment = async () => {
    if (!selectedDentistId || !selectedDate || !selectedTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    const appointmentType = APPOINTMENT_TYPES.find((t) => t.id === selectedType);

    bookAppointmentMutation.mutate(
      {
        doctorId: selectedDentistId,
        date: selectedDate,
        time: selectedTime,
        reason: appointmentType?.name,
      },
      {
        onSuccess: async (appointment) => {
          // store the appointment details to show in the modal
          setBookedAppointment(appointment);

          try {
            const emailResponse = await fetch("/api/send-appointment-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userEmail: appointment.patientEmail,
                doctorName: appointment.doctorName,
                appointmentDate: format(new Date(appointment.date), "EEEE, MMMM d, yyyy"),
                appointmentTime: appointment.time,
                appointmentType: appointmentType?.name,
                duration: appointmentType?.duration,
                price: appointmentType?.price,
              }),
            });

            if (!emailResponse.ok) console.error("Failed to send confirmation email");
          } catch (error) {
            console.error("Error sending confirmation email:", error);
          }

          // show the success modal
          setShowConfirmationModal(true);

          // reset form
          setSelectedDentistId(null);
          setSelectedDate("");
          setSelectedTime("");
          setSelectedType("");
          setCurrentStep(1);
        },
        onError: (error) => toast.error(`Failed to book appointment: ${error.message}`),
      }
    );
  };

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {/* HEADER SECTION */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Book Your Appointment</h1>
          <p className="text-muted-foreground text-lg">
            Schedule a consultation with our experienced dentists. Choose your preferred doctor, date, and time.
          </p>
        </div>

        {/* INFO CARDS */}
        {currentStep === 1 && (
          <div className="grid md:grid-cols-3 gap-4 mb-8 pb-8 border-b border-border">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-950/10 border-blue-200/50 dark:border-blue-900/30">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <User2Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Verified Doctors</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Select from our team of certified dental professionals with years of experience.
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-950/20 dark:to-purple-950/10 border-purple-200/50 dark:border-purple-900/30">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Flexible Scheduling</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pick any available date and time slot that works best for you.
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/20 dark:to-green-950/10 border-green-200/50 dark:border-green-900/30">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Quick Booking</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete your booking in just 3 steps with instant confirmation.
                </p>
              </div>
            </Card>
          </div>
        )}

        <ProgressSteps currentStep={currentStep} />

        {/* BOOKING STEPS SECTION */}
        <div className="mb-12">
          {currentStep === 1 && (
            <DoctorSelectionStep
              selectedDentistId={selectedDentistId}
              onContinue={() => setCurrentStep(2)}
              onSelectDentist={handleSelectDentist}
            />
          )}

          {currentStep === 2 && selectedDentistId && (
            <TimeSelectionStep
              selectedDentistId={selectedDentistId}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedType={selectedType}
              onBack={() => setCurrentStep(1)}
              onContinue={() => setCurrentStep(3)}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
              onTypeChange={setSelectedType}
            />
          )}

          {currentStep === 3 && selectedDentistId && (
            <BookingConfirmationStep
              selectedDentistId={selectedDentistId}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedType={selectedType}
              isBooking={bookAppointmentMutation.isPending}
              onBack={() => setCurrentStep(2)}
              onModify={() => setCurrentStep(2)}
              onConfirm={handleBookAppointment}
            />
          )}
        </div>
      </div>

      {bookedAppointment && (
        <AppointmentConfirmationModal
          open={showConfirmationModal}
          onOpenChange={setShowConfirmationModal}
          appointmentDetails={{
            doctorName: bookedAppointment.doctorName,
            appointmentDate: format(new Date(bookedAppointment.date), "EEEE, MMMM d, yyyy"),
            appointmentTime: bookedAppointment.time,
            userEmail: bookedAppointment.patientEmail,
          }}
        />
      )}

      {/* UPCOMING APPOINTMENTS SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-12 border-t border-border">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Your Appointments</h2>
            {userAppointments.length > 0 && (
              <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-gradient-to-r from-primary to-primary/80 rounded-full">
                {userAppointments.length}
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            {userAppointments.length === 0 
              ? "No appointments scheduled yet. Book your first consultation above!" 
              : "Your scheduled consultations and their details"}
          </p>
        </div>

        {userAppointments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userAppointments.map((appointment, index) => (
              <Card
                key={appointment.id}
                className="bg-gradient-to-br from-card to-card/50 border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                <div className="p-6 space-y-4">
                  {/* Doctor Info */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={appointment.doctorImageUrl}
                        alt={appointment.doctorName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">Dr. {appointment.doctorName}</h3>
                      <p className="text-xs text-muted-foreground truncate">{appointment.reason}</p>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="space-y-2 pt-2 border-t border-border/30">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-foreground font-medium">
                        {format(new Date(appointment.date), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-foreground font-medium">{appointment.time}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-green-600">Confirmed</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed bg-muted/30">
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Appointments Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't booked any appointments yet. Start by selecting a doctor above to schedule your first visit!
              </p>
              <Button onClick={() => setCurrentStep(1)} className="bg-gradient-to-r from-primary to-primary/80">
                Book Your First Appointment
              </Button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}

export default AppointmentsPage;
