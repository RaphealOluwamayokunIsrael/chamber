"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function CreatePage() {
  const router = useRouter();

  const [chamberName, setChamberName] = useState("");
  const [chamberCode, setChamberCode] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [organization, setOrganization] = useState("");
  const [division, setDivision] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      chamberName.trim() === "" ||
      chamberCode.trim() === "" ||
      description.trim() === "" ||
      category.trim() === "" ||
      organization.trim() === ""
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setMessage("You must be logged in.");
      return;
    }

    const formattedCode = chamberCode.trim().toUpperCase();

    const { data: existing } = await supabase
      .from("chambers")
      .select("id")
      .eq("chamber_code", formattedCode)
      .maybeSingle();

    if (existing) {
      setLoading(false);
      setMessage("❌ Chamber Code already exists.");
      return;
    }

    const { data: chamber, error } = await supabase
      .from("chambers")
      .insert([
{
  chamber_name: chamberName,
  chamber_code: formattedCode,
  description,
  category,
  organization,
  division,
  visibility: "private",
  owner_id: user.id,
  profiles: user.id,
}
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      setMessage(`❌ ${error.message}`);
      return;
    }

    const { error: memberError } = await supabase
      .from("members")
      .insert([
        {
          chamber_id: chamber.id,
          user_id: user.id,
          role: "Owner",
        },
      ]);

    if (memberError) {
      console.error(memberError);
      setLoading(false);
      setMessage(`❌ ${memberError.message}`);
      return;
    }

    setMessage("✅ Chamber created successfully!");

    setChamberName("");
    setChamberCode("");
    setDescription("");
    setCategory("");
    setOrganization("");
    setDivision("");

    setLoading(false);

    setTimeout(() => {
     router.push(`/chamber/${chamber.id}`);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 p-8 shadow-lg">

        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Create Chamber
        </h1>

        <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
          Create a secure collaboration space for your organization.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
            <label className="block mb-2 font-medium text-gray-900 dark:text-white">
              Chamber Name
            </label>

            <input
              type="text"
              placeholder="Enter chamber name"
              value={chamberName}
              onChange={(e) => setChamberName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-900 dark:text-white">
              Chamber Code
            </label>

            <input
              type="text"
              placeholder="e.g. ABC-HQ"
              value={chamberCode}
              onChange={(e) => setChamberCode(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 uppercase text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Choose a unique code that members will use to join your Chamber.
            </p>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-900 dark:text-white">
              Description
            </label>

            <textarea
              rows={4}
              placeholder="Describe your Chamber"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-900 dark:text-white">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select Category</option>
              <option value="University">University</option>
              <option value="Church / Ministry">Church / Ministry</option>
              <option value="Company">Company</option>
              <option value="NGO">NGO</option>
              <option value="Government">Government</option>
              <option value="Professional Association">Professional Association</option>
              <option value="Community">Community</option>
              <option value="School">School</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-900 dark:text-white">
              Organization
            </label>

            <input
              type="text"
              placeholder="e.g. University of Ilorin"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-900 dark:text-white">
              Division (Optional)
            </label>

            <input
              type="text"
              placeholder="Faculty, Department, Team, Unit..."
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black py-3 text-white font-semibold transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {loading ? "Creating Chamber..." : "Create Chamber"}
          </button>

          {message && (
            <div
              className={`rounded-lg p-3 text-center ${
                message.startsWith("✅")
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {message}
            </div>
          )}

        </form>

        <div className="mt-10 border-t border-gray-300 pt-6 text-center dark:border-gray-700">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Powered by
          </p>

          <h2 className="text-xl font-bold tracking-widest text-gray-900 dark:text-white">
            RIO LAB
          </h2>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Building purposeful software for organizations.
          </p>

        </div>

      </div>
    </main>
  );
}  