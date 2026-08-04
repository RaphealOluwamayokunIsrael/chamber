type MessageBubbleProps = {
  message: string;
  senderName: string;
  isMine: boolean;
  createdAt: string;
};

export default function MessageBubble({
  message,
  senderName,
  isMine,
  createdAt,
}: MessageBubbleProps) {
  return (
    <div
      className={`flex mb-4 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow ${
          isMine
            ? "bg-blue-600 text-white"
            : "bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
        }`}
      >
        {!isMine && (
          <p className="text-xs font-bold mb-1 text-blue-600">
            {senderName}
          </p>
        )}

        <p className="whitespace-pre-wrap">
          {message}
        </p>

        <p
          className={`mt-2 text-right text-xs ${
            isMine
              ? "text-blue-100"
              : "text-gray-500"
          }`}
        >
          {new Date(createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}