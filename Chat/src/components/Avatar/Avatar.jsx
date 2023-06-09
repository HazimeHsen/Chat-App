export default function Avatar({ userId, name, online }) {
  const colors = [
    "bg-teal-200",
    "bg-red-200",
    "bg-green-200",
    "bg-purple-200",
    "bg-blue-200",
    "bg-yellow-200",
    "bg-orange-200",
    "bg-pink-200",
    "bg-fuchsia-200",
    "bg-rose-200",
  ];
  const userIdBase10 = parseInt(userId ? userId : 16, 16);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];
  return (
    <div
      className={`relative w-8 h-8 bg-red-200 rounded-full text-center flex items-center ${color}`}>
      <div className="text-center w-full"> {name[0]}</div>

      <div
        className={`absolute w-2 h-2 ${
          online ? "bg-green-400" : "bg-gray-400"
        } bottom-0 right-0 rounded-full`}></div>
    </div>
  );
}
