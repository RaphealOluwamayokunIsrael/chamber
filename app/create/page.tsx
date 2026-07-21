"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function CreatePage() {
  const [chamberName, setChamberName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [organization, setOrganization] = useState("");
  const [division, setDivision] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      chamberName.trim() === "" ||
      description.trim() === "" ||
      category.trim() === "" ||
      organization.trim() === ""
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    const { error } = await supabase.from("chambers").insert([
      {
        chamber_name: chamberName,
        description: description,
        category: category,
        organization: organization,
        division: division,
      },
    ]);

    if (error) {
      console.error(error);
      setMessage(`❌ ${error.message}`);
      return;
    }

    setMessage("✅ Chamber created successfully!");

    setChamberName("");
    setDescription("");
    setCategory("");
    setOrganization("");
    setDivision("");
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
              Description
            </label>

            <textarea
              rows={4}
              placeholder="Describe your chamber"
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
            className="w-full rounded-lg bg-black py-3 text-white dark:bg-white dark:text-black"
          >
            Create Chamber
          </button>

          {message && (
            <div className="rounded-lg bg-green-100 dark:bg-green-900 p-3 text-center text-green-700 dark:text-green-200">
              {message}
            </div>
          )}

          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4">
            <h2 className="font-bold text-gray-900 dark:text-white">
              Chamber Preview
            </h2>

            <p className="text-gray-700 dark:text-gray-300">
              <strong>Name:</strong> {chamberName || "Not entered"}
            </p>

            <p className="text-gray-700 dark:text-gray-300">
              <strong>Description:</strong> {description || "Not entered"}
            </p>

            <p className="text-gray-700 dark:text-gray-300">
              <strong>Category:</strong> {category || "Not entered"}
            </p>

            <p className="text-gray-700 dark:text-gray-300">
              <strong>Organization:</strong> {organization || "Not entered"}
            </p>

            <p className="text-gray-700 dark:text-gray-300">
              <strong>Division:</strong> {division || "Not entered"}
            </p>
          </div>

        </form>

        <div className="mt-10 border-t border-gray-300 dark:border-gray-700 pt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Powered by
          </p>

          <h2 className="text-xl font-bold tracking-widest text-gray-900 dark:text-white">
            RIO LAB
          </h2>

          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Building purposeful software for organizations.
          </p>
        </div>

      </div>
    </main>
  );
}