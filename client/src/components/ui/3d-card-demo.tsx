import { InteractiveTravelCard } from "./3d-card";

export default function InteractiveTravelCardDemo() {
  return (
    // The container provides perspective for the 3D effect.
    <div className="flex min-h-[30rem] w-full items-center justify-center bg-[#0f172a] p-8">
       <div 
        style={{
          perspective: "1000px"
        }}
       >
        <InteractiveTravelCard
          title="Sapa Valley"
          subtitle="Vietnam"
          imageUrl="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop"
          actionText="Book your trip"
          href="https://en.wikipedia.org/wiki/Sa_Pa"
          onActionClick={() => {
            alert("This action can be customized via the onActionClick prop.");
          }}
        />
      </div>
    </div>
  );
}
