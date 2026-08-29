"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");

    /*
     * REQUIRED FIELDS
     */
    if (
      !chamberName.trim() ||
      !chamberCode.trim() ||
      !description.trim() ||
      !category.trim() ||
      !organization.trim() ||
      !division.trim()
    ) {
      setMessage(
        "Please complete all required fields."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * CHECK LOGIN
       */
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        setLoading(false);
        return;
      }

      /*
       * NORMALIZE CHAMBER CODE
       */
      const code = chamberCode
        .trim()
        .toUpperCase();

      /*
       * CHECK WHETHER CHAMBER CODE ALREADY EXISTS
       */
      const {
        data: existing,
        error: existingError,
      } = await supabase
        .from("chambers")
        .select("id")
        .eq("chamber_code", code)
        .maybeSingle();

      if (existingError) {
        console.error(
          "CHECK CHAMBER CODE ERROR:",
          existingError
        );

        setMessage(
          "Unable to check the Chamber code."
        );

        setLoading(false);
        return;
      }

      if (existing) {
        setMessage(
          "❌ Chamber code already exists. Please choose another code."
        );

        setLoading(false);
        return;
      }

      /*
       * CREATE CHAMBER
       */
      const {
        data: chamber,
        error: chamberError,
      } = await supabase
        .from("chambers")
        .insert([
          {
            chamber_name: chamberName.trim(),
            chamber_code: code,
            description: description.trim(),
            category: category.trim(),
            organization: organization.trim(),
            division: division.trim(),
            visibility: "private",
            owner_id: user.id,
          },
        ])
        .select()
        .single();

      if (chamberError || !chamber) {
        console.error(
          "CREATE CHAMBER ERROR:",
          chamberError
        );

        setMessage(
          chamberError?.message ??
            "Failed to create Chamber."
        );

        setLoading(false);
        return;
      }

      /*
       * ADD CREATOR AS ADMIN
       */
      const {
        error: memberError,
      } = await supabase
        .from("members")
        .insert([
          {
            chamber_id: chamber.id,
            user_id: user.id,
            role: "Admin",
          },
        ]);

      if (memberError) {
        console.error(
          "ADD CHAMBER ADMIN ERROR:",
          memberError
        );

        setMessage(
          "Chamber was created, but your administrator membership could not be created."
        );

        setLoading(false);
        return;
      }

      /*
       * OPEN THE NEW CHAMBER
       */
      router.push(
        `/chamber/${chamber.id}`
      );
    } catch (error) {
      console.error(
        "CREATE CHAMBER ERROR:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the Chamber."
      );

      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6 dark:bg-gray-950">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Chamber
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create a secure collaboration space
            for your organization.
          </p>
        </div>

        {/* COMPANY TEMPLATE */}
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Company Template
          </p>

          <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
            Atlantic Energy Resources
          </p>

          <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">
            Operations Department
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          {/* CHAMBER NAME */}
          <div>
            <label className="mb-2 block font-medium text-gray-900 dark:text-white">
              Chamber Name
            </label>

            <input
              type="text"
              value={chamberName}
              onChange={(e) =>
                setChamberName(
                  e.target.value
                )
              }
              placeholder="Operations Strategy Chamber"
              className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* CHAMBER CODE */}
          <div>
            <label className="mb-2 block font-medium text-gray-900 dark:text-white">
              Chamber Code
            </label>

            <input
              type="text"
              value={chamberCode}
              onChange={(e) =>
                setChamberCode(
                  e.target.value.toUpperCase()
                )
              }
              placeholder="OIL-500"
              className="w-full rounded-lg border border-gray-300 p-3 uppercase dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />

            <p className="mt-1 text-sm text-gray-500">
              Members will use this code to join
              the Chamber.
            </p>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="mb-2 block font-medium text-gray-900 dark:text-white">
              Description
            </label>

            <textarea
              rows={4}
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Secure collaboration space for the company's operations and strategy team."
              className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="mb-2 block font-medium text-gray-900 dark:text-white">
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">
                Select Category
              </option>

              <option value="Company">
                Company
              </option>

              <option value="University">
                University
              </option>

              <option value="Church / Ministry">
                Church / Ministry
              </option>

              <option value="NGO">
                NGO
              </option>

              <option value="Government">
                Government
              </option>

              <option value="Professional Association">
                Professional Association
              </option>

              <option value="Community">
                Community
              </option>

              <option value="School">
                School
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          {/* ORGANIZATION */}
          <div>
            <label className="mb-2 block font-medium text-gray-900 dark:text-white">
              Organization
            </label>

            <input
              type="text"
              value={organization}
              onChange={(e) =>
                setOrganization(
                  e.target.value
                )
              }
              placeholder="Atlantic Energy Resources"
              className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* DIVISION */}
          <div>
            <label className="mb-2 block font-medium text-gray-900 dark:text-white">
              Division
            </label>

            <input
              type="text"
              value={division}
              onChange={(e) =>
                setDivision(
                  e.target.value
                )
              }
              placeholder="Operations Department"
              className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />

            <p className="mt-1 text-sm text-gray-500">
              Division is required.
            </p>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating Chamber..."
              : "Create Chamber"}
          </button>

          {/* MESSAGE */}
          {message && (
            <div
              className={`rounded-lg p-3 text-center ${
                message.startsWith("❌")
                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                  : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
              }`}
            >
              {message}
            </div>
          )}

        </form>

        {/* FOOTER */}
        <div className="mt-8 border-t pt-6 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500">
            Powered by
          </p>

          <h2 className="text-xl font-bold tracking-widest text-gray-900 dark:text-white">
            RIO LAB
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Building purposeful software for organizations.
          </p>
        </div>

      </div>
    </main>
  );
}