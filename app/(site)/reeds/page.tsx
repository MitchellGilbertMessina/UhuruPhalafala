import Header from "@/components/layout/Header";
import ObjectCard from "@/components/objects/ObjectCard";
import ObjectCanvas from "@/components/objects/ObjectCanvas";
import { mockObjects } from "@/lib/mockObjects";

export default function ReedsPage() {
  return (
    <div className="flex h-screen flex-col bg-[#EFE8D2]">
      <Header />

      <main className="flex flex-1 min-h-0">
        {/* Left Sidebar */}
        <aside className="flex w-64 flex-shrink-0 flex-col justify-between px-8 py-8">
          <div>
            <h1
              className="leading-none"
              style={{
                fontFamily: "Georgia",
                fontSize: "3rem",
                fontWeight: 400,
              }}
            >
              Reeds
            </h1>
          </div>

          <nav
            style={{
              fontFamily: "Georgia",
              fontStyle: "italic",
              fontSize: "1rem",
            }}
          >
            <ul className="space-y-2">
              <li>Books</li>
              <li>Visual Arts</li>
              <li>Philosophy</li>
            </ul>
          </nav>
        </aside>

        {/* Scrollable Canvas */}
        <ObjectCanvas objects={mockObjects} />
      </main>
    </div>
  );
}