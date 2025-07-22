import Notes from "@/components/Notes";

/**
 * The homepage of the application.
 *
 * Displays a simple page with a `Notes` component.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen max-w-screen-lg flex-col items-center justify-center mx-auto p-24">
      <Notes />
    </main>
  );
}
