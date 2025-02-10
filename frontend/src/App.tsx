import { PhotoUpload } from "./components/PhotoUpload";
import { PhotoGrid } from "./components/PhotoGrid";

function App() {
  // For now, we'll hardcode eventId to 1 for testing
  const eventId = 1;

  return (
    <div className="min-h-screen bg-rose-50">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 py-6 max-w-[1800px]">
        <h1 className="text-center text-3xl md:text-4xl font-serif text-gray-800 mb-4">
          Wedding Moments
        </h1>
        <p className="text-center text-gray-600 mb-8 max-w-md mx-auto">
          Share your special moments from our wedding day. Every photo helps
          tell our story.
        </p>
        <div className="flex justify-center items-center pb-8">
          <div className="w-full max-w-lg mx-auto">
            <PhotoUpload />
          </div>
        </div>
        <PhotoGrid eventId={eventId} />
      </div>
    </div>
  );
}

export default App;
