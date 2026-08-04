"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Chamber {
  id: string;
  chamber_name: string;
  description: string;
  organization: string;
  division: string;
  category: string;
}

export default function BrowsePage() {
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChambers();
  }, []);

  async function fetchChambers() {
    const { data, error } = await supabase
      .from("chambers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Error:", error);
    } else {
      setChambers(data || []);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold text-center text-blue-700 mb-2">
          Browse Chambers
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Discover and join existing chambers.
        </p>

        {loading ? (
          <p className="text-center">Loading chambers...</p>
        ) : chambers.length === 0 ? (
          <p className="text-center">No chambers found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {chambers.map((chamber) => (
              <div
                key={chamber.id}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-blue-700">
                  {chamber.chamber_name}
                </h2>

                <p className="mt-3 text-gray-700">
                  {chamber.description}
                </p>

                <div className="mt-4 space-y-2">

                  <p>
                    <strong>Organization:</strong>{" "}
                    {chamber.organization}
                  </p>

                  <p>
                    <strong>Division:</strong>{" "}
                    {chamber.division}
                  </p>

                  <p>
                    <strong>Category:</strong>{" "}
                    {chamber.category}
                  </p>

                </div>

                <button
                  onClick={() =>
                    alert(`Joining ${chamber.chamber_name}...`)
                  }
                  className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                >
                  Join Chamber
                </button>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}