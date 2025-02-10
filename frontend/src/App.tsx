import { PhotoUpload } from "./components/PhotoUpload";
import { PhotoGrid } from "./components/PhotoGrid";

function App() {
  // For now, we'll hardcode eventId to 1 for testing
  const eventId = 1;

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center pt-16 pb-12">
          <div className="w-full max-w-lg mx-auto">
            <PhotoUpload />
          </div>
        </div>
        <div className="mt-4">
          <PhotoGrid eventId={eventId} />
        </div>
      </div>
    </div>
  );
}

export default App;
