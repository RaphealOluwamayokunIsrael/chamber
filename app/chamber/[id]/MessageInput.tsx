"use client";

type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export default function MessageInput({
  value,
  onChange,
  onSend,
}: MessageInputProps) {
  function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    const isDesktop = window.innerWidth >= 768;

    if (isDesktop && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="border-t p-4 dark:border-gray-700">

      <textarea
        placeholder="Type a message..."
        value={value}
        onChange={(e) => {
          onChange(e.target.value);

          e.target.style.height = "48px";
          e.target.style.height = e.target.scrollHeight + "px";
        }}
        onKeyDown={handleKeyDown}
        rows={1}
        className="w-full resize-none overflow-hidden rounded-lg border p-3 dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{
          minHeight: "48px",
          maxHeight: "150px",
        }}
      />

      <div className="mt-3 flex justify-end">
        <button
          onClick={onSend}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          Send
        </button>
      </div>

    </div>
  );
}