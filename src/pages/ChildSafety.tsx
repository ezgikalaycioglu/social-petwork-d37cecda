import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ChildSafety = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">Child Safety Policy</h1>
          <p className="text-muted-foreground text-lg">
            Our commitment to protecting children and animals
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">PawCult Child Safety Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-gray max-w-none">
              <p className="text-lg leading-relaxed">
                PawCult is committed to protecting the safety of children and animals. We do not tolerate any form of child sexual abuse material (CSAM), exploitation, or harmful behavior on our platform.
              </p>

              <div className="bg-secondary/10 p-6 rounded-lg border-l-4 border-primary">
                <h3 className="text-xl font-semibold text-primary mb-3">Our Policies</h3>
                <ul className="space-y-3 text-base">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></span>
                    Our app does not target children or allow underage users to create accounts.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></span>
                    Any content or behavior that may be related to CSAM is strictly prohibited.
                  </li>
                </ul>
              </div>

              <div className="bg-accent/10 p-6 rounded-lg border-l-4 border-accent">
                <h3 className="text-xl font-semibold text-accent mb-3">Reporting</h3>
                <p className="text-base leading-relaxed mb-3">
                  Users can report abusive content directly within the app or via email at{" "}
                  <a 
                    href="mailto:info.pawcult@gmail.com" 
                    className="text-accent hover:underline font-medium"
                  >
                    info.pawcult@gmail.com
                  </a>
                </p>
                <p className="text-base leading-relaxed">
                  Reported content is reviewed promptly, and appropriate action — including account suspension and law enforcement notification — will be taken.
                </p>
              </div>

              <div className="bg-muted/50 p-6 rounded-lg border-l-4 border-muted-foreground">
                <h3 className="text-xl font-semibold text-foreground mb-3">Compliance</h3>
                <p className="text-base leading-relaxed">
                  We fully comply with relevant child safety laws and cooperate with national and regional authorities to address such issues.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChildSafety;