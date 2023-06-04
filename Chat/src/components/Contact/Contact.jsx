import Avatar from "../Avatar/Avatar";

export default function Contact({
  userId,
  onClick,
  selected,
  username,
  online,
}) {
  return (
    <div
      onClick={() => onClick(userId)}
      className={`relative border-b border-gray-100 flex cursor-pointer ${
        selected ? "bg-blue-50" : ""
      }`}>
      <div className="pl-4 py-2 flex  gap-3  items-center">
        <Avatar online={online} name={username} userId={userId} />
        <span className="text-gray-800">{username}</span>
      </div>
    </div>
  );
}
