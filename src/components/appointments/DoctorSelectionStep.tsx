import { useAvailableDoctors } from "@/hooks/use-doctors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { MapPinIcon, PhoneIcon, StarIcon, CheckCircleIcon, Calendar } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DoctorCardsLoading } from "./DoctorCardsLoading";

interface DoctorSelectionStepProps {
  selectedDentistId: string | null;
  onSelectDentist: (dentistId: string) => void;
  onContinue: () => void;
}

function DoctorSelectionStep({
  onContinue,
  onSelectDentist,
  selectedDentistId,
}: DoctorSelectionStepProps) {
  const { data: dentists = [], isLoading } = useAvailableDoctors();

  if (isLoading)
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Choose Your Dentist</h2>
        <DoctorCardsLoading />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Choose Your Dentist</h2>
          <p className="text-muted-foreground">Select from our verified and experienced dental professionals</p>
        </div>
        <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold text-primary bg-primary/10 rounded-full">
          {dentists.length} Available
        </span>
      </div>

      {dentists.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dentists.map((dentist) => (
            <Card
              key={dentist.id}
              className={`cursor-pointer transition-all duration-300 overflow-hidden group hover:shadow-lg ${
                selectedDentistId === dentist.id 
                  ? "ring-2 ring-primary bg-primary/5 shadow-lg" 
                  : "hover:border-primary/50"
              }`}
              onClick={() => onSelectDentist(dentist.id)}
            >
              <CardHeader className="pb-3">
                <div className="space-y-4">
                  {/* Doctor Image */}
                  <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={dentist.imageUrl!}
                      alt={dentist.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {selectedDentistId === dentist.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <CheckCircleIcon className="w-12 h-12 text-primary fill-current" />
                      </div>
                    )}
                  </div>

                  {/* Doctor Info */}
                  <div>
                    <CardTitle className="text-xl mb-1">Dr. {dentist.name}</CardTitle>
                    <CardDescription className="text-primary font-semibold text-sm">
                      {dentist.speciality || "General Dentistry"}
                    </CardDescription>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-lg">
                      <StarIcon className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold">5.0</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {dentist.appointmentCount} appointments completed
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPinIcon className="w-4 h-4 flex-shrink-0 text-primary" />
                    <span>DentWise Medical Center</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PhoneIcon className="w-4 h-4 flex-shrink-0 text-primary" />
                    <span>{dentist.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 flex-shrink-0 text-primary" />
                    <span>Available Today</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-muted-foreground pt-2 border-t border-border/50">
                  {dentist.bio || "Experienced dental professional providing quality care and personalized treatment plans."}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" className="text-xs">Licensed Professional</Badge>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <CheckCircleIcon className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                </div>

                {/* Selection Indicator */}
                {selectedDentistId === dentist.id && (
                  <div className="pt-2 border-t border-primary/20">
                    <p className="text-xs font-semibold text-primary flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4 fill-current" /> Selected
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No doctors available at the moment. Please try again later.</p>
        </div>
      )}

      {/* Continue Button */}
      {selectedDentistId && (
        <div className="flex justify-end pt-6 border-t border-border">
          <Button 
            onClick={onContinue}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-8 py-2 rounded-lg font-semibold"
          >
            Continue to Time Selection
          </Button>
        </div>
      )}
    </div>
  );
}
export default DoctorSelectionStep;
